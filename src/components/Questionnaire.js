import React, { useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function Questionnaire({ moduleId = '', moduleName = '' }) {
  const { siteConfig } = useDocusaurusContext();
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    moduleId: moduleId,
    moduleName: moduleName,
    completed: '',
    confidence: '3',
    comments: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const apiEndpoint = siteConfig.customFields.apiEndpoint;
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          moduleId: moduleId,
          moduleName: moduleName,
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        }),
      });

      if (response.ok) {
        setStatus('✅ Thank you! Your progress has been recorded.');
        setFormData({
          studentName: '',
          studentEmail: '',
          completed: '',
          confidence: '3',
          comments: ''
        });
      } else {
        setStatus('❌ Submission failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMsg = error.message || 'Unknown error';
      setStatus(`❌ Error: ${errorMsg}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
      backgroundColor: 'var(--ifm-background-surface-color)'
    }}>
      <h3>Self-Assessment Questionnaire</h3>
      <p>Please complete this form to track your learning progress.</p>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="studentName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Name *
          </label>
          <input
            type="text"
            id="studentName"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="studentEmail" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Email *
          </label>
          <input
            type="email"
            id="studentEmail"
            name="studentEmail"
            value={formData.studentEmail}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="completed" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            What did you complete? *
          </label>
          <textarea
            id="completed"
            name="completed"
            value={formData.completed}
            onChange={handleChange}
            required
            rows="3"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confidence" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Confidence Level (1-5) *
          </label>
          <select
            id="confidence"
            name="confidence"
            value={formData.confidence}
            onChange={handleChange}
            required
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          >
            <option value="1">1 - Not confident</option>
            <option value="2">2 - Slightly confident</option>
            <option value="3">3 - Moderately confident</option>
            <option value="4">4 - Very confident</option>
            <option value="5">5 - Extremely confident</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="comments" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Additional Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            value={formData.comments}
            onChange={handleChange}
            rows="3"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: '#25c2a0',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Submitting...' : 'Submit Progress'}
        </button>

        {status && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
            color: status.includes('✅') ? '#155724' : '#721c24'
          }}>
            {status}
          </div>
        )}
      </form>
    </div>
  );
}
