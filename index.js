// Simple Express backend for course registration form

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
const fs = require('fs');

// For demonstration, using an in-memory array instead of a real database
const registrations = [];

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Google Sheets setup
const SPREADSHEET_ID = '1q57MEasqClXNODFig8xhclPsgcyjkQNYWnG9SyB8mWc';
// Place your Google service account credentials in a file named 'google-credentials.json' in this folder
const CREDENTIALS_PATH = path.join(__dirname, 'google-credentials.json');

// Helper to append to Google Sheet
async function appendToSheet(data) {
    const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    await doc.useServiceAccountAuth(creds);
    await doc.loadInfo();
    const sheet = doc.sheetsByIndex[0]; // first sheet
    await sheet.addRow(data);
}

// Handle form POST
app.post('/api/register-course', async (req, res) => {
    const {
        full_name,
        email,
        phone,
        age,
        course,
        mode_learning,
        preferred_communication,
        school,
        location,
        how_heard,
        consent
    } = req.body;

    // Basic validation
    if (!full_name || !email || !phone || !age || !course || !mode_learning || !preferred_communication || !location || !how_heard || !consent) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    // Save to "database"
    registrations.push({
        full_name,
        email,
        phone,
        age,
        course,
        mode_learning,
        preferred_communication,
        school,
        location,
        how_heard,
        consent,
        submittedAt: new Date()
    });

    // Save to Google Sheet
    try {
        await appendToSheet({
            'Full Name': full_name,
            'Email': email,
            'Phone': phone,
            'Age': age,
            'Course': course,
            'Mode of Learning': mode_learning,
            'Preferred Communication': preferred_communication,
            'School': school,
            'Location': location,
            'How Heard': how_heard,
            'Consent': consent,
            'Submitted At': new Date().toISOString()
        });
        res.json({ success: true, message: 'Registration received and saved to Google Sheet.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Error saving to Google Sheet.', error: err.message });
    }
});

// For testing: get all registrations
app.get('/api/registrations', (req, res) => {
    res.json(registrations);
});

// Serve static files for the registration page
const staticPath = path.join(__dirname);
app.use(express.static(staticPath));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Course registration backend running on port ${PORT}`);
});
