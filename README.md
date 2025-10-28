# Prompt Engineering Training Site

This project is a Docusaurus-based training site for Prompt Engineering that tracks student progress using Splunk.

## Architecture

The project consists of:
1. **Docusaurus Frontend** - Static site hosted on GitHub Pages or GitLab Pages
2. **React Questionnaire Component** - Interactive form for student self-assessment
3. **Backend API Server** - Node.js/Express server that forwards data to Splunk HEC
4. **Splunk HEC** - Receives and indexes student progress data

## Prerequisites

- Node.js 18+
- npm or yarn
- Splunk instance with HEC endpoint configured
- GitHub or GitLab account for Pages hosting

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Splunk HEC

1. Log into your Splunk instance
2. Navigate to Settings > Data Inputs > HTTP Event Collector
3. Create a new HEC token
4. Note the HEC URL and token

### 3. Configure Backend API

The backend API server needs to be hosted separately (not on GitLab Pages, as it's dynamic).

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your Splunk credentials:
```
SPLUNK_HEC_URL=https://your-splunk-instance.com:8088/services/collector
SPLUNK_HEC_TOKEN=your-hec-token-here
PORT=3001
```

3. Install backend dependencies:
```bash
npm install --prefix ./ --package-lock-only express cors axios dotenv
```

4. Deploy the backend API to a cloud service:
   - AWS Lambda + API Gateway
   - Azure Functions
   - Google Cloud Functions
   - Heroku
   - Any Node.js hosting service

### 4. Configure Frontend

Edit `docusaurus.config.js` and update:

```javascript
customFields: {
  apiEndpoint: 'https://your-api-endpoint.com/api/submit',
},
```

Update the `url` and `baseUrl` for your hosting platform:

**For GitHub Pages:**
```javascript
url: 'https://your-github-username.github.io',
baseUrl: '/prompteng-dev-site/',
```

**For GitLab Pages:**
```javascript
url: 'https://your-gitlab-username.gitlab.io',
baseUrl: '/prompteng-dev-site/',
```

### 5. Deploy to GitHub Pages or GitLab Pages

#### Option A: GitHub Pages

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push to GitHub:
```bash
git remote add origin https://github.com/your-username/prompteng-dev-site.git
git push -u origin main
```

4. Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    name: Deploy to GitHub Pages
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build website
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./build
```

5. Enable GitHub Pages in repository settings:
   - Go to Settings > Pages
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch and `/ (root)` folder
   - Save

6. Push the workflow file and GitHub Actions will automatically build and deploy

#### Option B: GitLab Pages

1. Initialize git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new project on GitLab

3. Push to GitLab:
```bash
git remote add origin https://gitlab.com/your-username/prompteng-dev-site.git
git push -u origin main
```

4. GitLab CI/CD will automatically build and deploy to GitLab Pages using the included `.gitlab-ci.yml`

## Local Development

### Run Docusaurus Locally

```bash
npm start
```

This opens `http://localhost:3000` with live reload.

### Run Backend API Locally

```bash
node server.js
```

The API runs on `http://localhost:3001`.

## Project Structure

```
prompteng-dev-site/
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions workflow (create this)
├── .gitlab-ci.yml          # GitLab CI/CD configuration
├── docusaurus.config.js    # Docusaurus configuration
├── sidebars.js            # Sidebar navigation
├── package.json           # Frontend dependencies
├── server.js              # Backend API server
├── server-package.json    # Backend dependencies
├── .env.example           # Environment variables template
├── docs/                  # Documentation pages
│   ├── intro.md
│   └── tutorial/
│       ├── basics.md
│       └── assessment.mdx # Page with questionnaire
├── src/
│   ├── components/
│   │   └── Questionnaire.js  # Self-assessment form
│   └── css/
│       └── custom.css
└── static/               # Static assets
    └── img/
```

## How It Works

1. Students complete the self-assessment questionnaire on the Docusaurus site
2. Form data is sent to the backend API endpoint
3. Backend API forwards data to Splunk HEC
4. Data is indexed in Splunk for analysis and visualization

## Splunk Query Examples

Search for all student assessments:
```spl
source="student-questionnaire" sourcetype="student:progress"
```

View confidence levels over time:
```spl
source="student-questionnaire" 
| timechart avg(event.confidence) by event.studentName
```

Count completions by page:
```spl
source="student-questionnaire" 
| stats count by event.page
```

## Customization

- Add more tutorial pages in `docs/`
- Customize the questionnaire in `src/components/Questionnaire.js`
- Update styling in `src/css/custom.css`
- Modify Splunk event format in `server.js`

## Support

For issues or questions, please open an issue on the GitLab repository.
