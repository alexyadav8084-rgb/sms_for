const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Render automatic PORT assign karega

// Middleware to parse URL-encoded data from Android App
app.use(bodyParser.urlencoded({ extended: true }));

// 1. Home Route - Check if server is live
app.get('/', (req, res) => {
    res.send(`
        <div style="text-align:center; margin-top:50px; font-family: sans-serif;">
            <h1>🚀 SMS Forwarder Server is Running!</h1>
            <p>Go to <b>/view-sms</b> to see recorded messages.</p>
        </div>
    `);
});

// 2. Receive SMS Route - App calls this via POST
app.post('/receive', (req, res) => {
    const sender = req.body.sender;
    const message = req.body.message;

    if (sender && message) {
        const logEntry = `[${new Date().toLocaleString()}] From: ${sender} | Msg: ${message}\n`;
        
        // SMS ko text file mein save karna
        fs.appendFile('sms_logs.txt', logEntry, (err) => {
            if (err) {
                console.error("❌ File save error:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log("✅ SMS Received:", logEntry);
            res.status(200).send("Success");
        });
    } else {
        console.log("⚠️ Invalid Data Received:", req.body);
        res.status(400).send("Bad Request: Missing sender or message");
    }
});

// 3. View SMS Route - To see logs in browser
app.get('/view-sms', (req, res) => {
    const filePath = path.join(__dirname, 'sms_logs.txt');
    
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.send("<h3>No logs found yet. Send an SMS to populate the list!</h3>");
        }
        res.send(`
            <div style="font-family: monospace; padding: 20px;">
                <h2>📱 Received SMS Logs</h2>
                <hr>
                <pre style="background: #f4f4f4; padding: 15px; border-radius: 5px;">${data}</pre>
                <br>
                <button onclick="window.location.reload()">Refresh Logs</button>
            </div>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`✅ Server is running on port ${PORT}`);
});