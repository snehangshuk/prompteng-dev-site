# Goal
The goal is to captures student questionnaire data from the Docusaurus front end and securely sends it to Splunk.

# How it should works
1. Docusaurus front end (React component): You will create a custom React component for the self-assessment questionnaire. When a student submits the form, a JavaScript function will send the data to your web server.
2. External API (Backend): Because GitLab Pages serves only static content, a separate, dynamic backend API is needed to process the data. This API should be hosted on a separate service, such as a cloud function (AWS Lambda, Azure Functions) or a simple server (e.g., using Node.js or Python).
The API's sole function is to receive the questionnaire data and forward it to Splunk's HTTP Event Collector (HEC).
3. Splunk HEC: Splunk's HEC is a token-based API that lets you send data directly to a Splunk deployment over HTTP/S. Your web server will format the student's progress data into a JSON payload and send it to the HEC endpoint.
4. Splunk analysis: Once the data is in Splunk, you can search, analyze, and visualize the student progress data using Splunk's powerful query language and dashboard features. 

# Steps tp Follow
Step 0: Run this in a virtual environment

Step 1:  React Component
    Create a React component to handle the self-assessment form and submission.
    1. Create the component file: Inside your Docusaurus project, create a new file, for example, src/components/Questionnaire.js.
    2. Build the component: The code below provides a basic example of a form with a fetch call to a API endpoint.

Step 2: Embed in MDX
Add the component to any Markdown page where you want the questionnaire to appear.

Step 3: Create the external API
The sever.js should sent the data to Splunk using SPLUNK_HEC_URL and SPLUNK_HEC_TOKEN

Step 4: Configure Docusaurus
Update your docusaurus.config.js to include the API endpoint.
