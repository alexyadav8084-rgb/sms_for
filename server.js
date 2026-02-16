const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3000; // Aap koi bhi port use kar sakte hain

// Middleware to parse URL-encoded data (जो Java app भेज रहा है)
app.use(bodyParser.urlencoded({ extended: true }));

// SMS Receive Endpoint
app.post('/receive', (req, res) => {
    const sender = req.body.sender;
    const message = req.body.message;

    if (sender && message) {
        const logEntry = `[${new Date().toLocaleString()}] From: ${sender} | Msg: ${message}\n`;
        
        // SMS ko file mein save karna
        fs.appendFile('sms_logs.txt', logEntry, (err) => {
            if (err) {
                console.error("File save error:", err);
                return res.status(500).send("Internal Server Error");
            }
            console.log("SMS Received and Logged:", logEntry);
            res.status(200).send("Success");
        });
    } else {
        console.log("Invalid Data Received:", req.body);
        res.status(400).send("Bad Request: Missing Data");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://your-ip-address:${PORT}`);
});