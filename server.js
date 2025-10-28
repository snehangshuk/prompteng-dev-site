const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = parseInt(process.env.PORT) || 8080;

app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: false
}));
app.use(express.json());

const SPLUNK_HEC_URL = process.env.SPLUNK_HEC_URL;
const SPLUNK_HEC_TOKEN = process.env.SPLUNK_HEC_TOKEN;

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const CSV_FILE_PATH = process.env.CSV_FILE_PATH || 
  (process.env.NODE_ENV === 'production' 
    ? path.join('/tmp', 'student-data.csv')
    : path.join(DATA_DIR, 'student-data.csv'));

function ensureCSVHeader() {
  if (!fs.existsSync(CSV_FILE_PATH)) {
    const header = 'timestamp,studentName,studentEmail,moduleId,moduleName,skills,totalSkills,checkedSkills,progressPercentage,page\n';
    fs.writeFileSync(CSV_FILE_PATH, header, 'utf8');
  }
}

function escapeCSV(field) {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function saveToCSV(studentData) {
  try {
    ensureCSVHeader();
    const skillsList = Array.isArray(studentData.skills) ? studentData.skills.join('; ') : '';
    const row = [
      studentData.timestamp || new Date().toISOString(),
      studentData.studentName,
      studentData.studentEmail,
      studentData.moduleId,
      studentData.moduleName,
      skillsList,
      studentData.totalSkills || 0,
      studentData.checkedSkills || 0,
      studentData.progressPercentage || 0,
      studentData.page
    ].map(escapeCSV).join(',') + '\n';
    
    fs.appendFileSync(CSV_FILE_PATH, row, 'utf8');
    console.log('Successfully saved to CSV:', CSV_FILE_PATH);
    return true;
  } catch (error) {
    console.error('Error saving to CSV:', error.message);
    return false;
  }
}

function readProgressFromCSV(email) {
  try {
    if (!fs.existsSync(CSV_FILE_PATH)) {
      return { assessments: [] };
    }

    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');
    
    const assessments = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const row = {};
      
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/^"|"$/g, '').replace(/""/g, '"');
        row[header.trim()] = value;
      });
      
      if (row.studentEmail && row.studentEmail.toLowerCase() === email.toLowerCase()) {
        assessments.push({
          timestamp: row.timestamp,
          moduleId: row.moduleId,
          moduleName: row.moduleName,
          skills: row.skills,
          totalSkills: row.totalSkills,
          checkedSkills: row.checkedSkills,
          progressPercentage: row.progressPercentage
        });
      }
    }
    
    return { assessments };
  } catch (error) {
    console.error('Error reading CSV:', error.message);
    return { assessments: [] };
  }
}

app.post('/api/submit', async (req, res) => {
  try {
    const studentData = req.body;

    console.log('Received submission:', studentData);

    let splunkSuccess = false;
    let splunkError = null;

    if (SPLUNK_HEC_URL && SPLUNK_HEC_TOKEN) {
      try {
        const splunkEvent = {
          time: Math.floor(Date.now() / 1000),
          source: 'student-questionnaire',
          sourcetype: 'student:progress',
          event: {
            studentName: studentData.studentName,
            studentEmail: studentData.studentEmail,
            moduleId: studentData.moduleId,
            moduleName: studentData.moduleName,
            skills: studentData.skills,
            totalSkills: studentData.totalSkills,
            checkedSkills: studentData.checkedSkills,
            progressPercentage: studentData.progressPercentage,
            timestamp: studentData.timestamp,
            page: studentData.page,
            eventType: 'student_assessment'
          }
        };

        const response = await axios.post(
          SPLUNK_HEC_URL,
          splunkEvent,
          {
            headers: {
              'Authorization': `Splunk ${SPLUNK_HEC_TOKEN}`,
              'Content-Type': 'application/json'
            },
            validateStatus: (status) => status < 500,
            timeout: 5000
          }
        );

        if (response.status === 200 || response.status === 201) {
          console.log('Successfully sent to Splunk:', response.data);
          splunkSuccess = true;
        } else {
          console.error('Splunk returned non-200 status:', response.status, response.data);
          splunkError = `Splunk returned status ${response.status}`;
        }
      } catch (error) {
        console.error('Error submitting to Splunk:', error.message);
        splunkError = error.message;
      }
    } else {
      console.warn('Splunk not configured, will save to CSV only');
      splunkError = 'Splunk not configured';
    }

    if (!splunkSuccess) {
      console.log('Falling back to CSV storage');
      const csvSuccess = saveToCSV(studentData);
      
      if (csvSuccess) {
        res.status(200).json({ 
          success: true, 
          message: 'Data saved to CSV (Splunk unavailable)',
          fallback: 'csv',
          splunkError: splunkError
        });
      } else {
        res.status(500).json({ 
          error: 'Failed to save data',
          message: 'Both Splunk and CSV storage failed'
        });
      }
    } else {
      res.status(200).json({ 
        success: true, 
        message: 'Data successfully submitted to Splunk' 
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    res.status(500).json({ 
      error: 'Failed to submit data',
      message: error.message 
    });
  }
});

app.get('/api/progress', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email parameter required' });
    }
    
    const progressData = readProgressFromCSV(email);
    res.status(200).json(progressData);
  } catch (error) {
    console.error('Error fetching progress:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch progress',
      message: error.message 
    });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Student Progress Tracker API',
    endpoints: {
      health: '/health',
      submit: '/api/submit',
      progress: '/api/progress'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    splunkConfigured: !!(SPLUNK_HEC_URL && SPLUNK_HEC_TOKEN)
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Server successfully started`);
  console.log(`✓ Listening on 0.0.0.0:${PORT}`);
  console.log(`✓ Splunk HEC configured: ${!!(SPLUNK_HEC_URL && SPLUNK_HEC_TOKEN)}`);
  console.log(`✓ CSV storage path: ${CSV_FILE_PATH}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ Ready to accept connections`);
});

server.on('error', (error) => {
  console.error('✗ Server startup error:', error);
  process.exit(1);
});
