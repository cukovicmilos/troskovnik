const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'troskovnik.md');

// Middleware
app.use(express.text({ type: 'text/plain' }));
app.use(express.json());

// Disable caching for HTML files
app.use((req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/') {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
    }
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

// GET /api/data - čita troskovnik.md i vraća raw content
app.get('/api/data', (req, res) => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return res.status(404).json({ error: 'Data file not found' });
        }
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        res.type('text/plain').send(content);
    } catch (error) {
        console.error('Error reading data file:', error);
        res.status(500).json({ error: 'Failed to read data file' });
    }
});

// POST /api/data - prima raw .md content i piše u troskovnik.md
app.post('/api/data', (req, res) => {
    try {
        const content = req.body;
        if (typeof content !== 'string') {
            return res.status(400).json({ error: 'Content must be plain text' });
        }

        // Ensure data directory exists
        const dataDir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(DATA_FILE, content, 'utf-8');
        res.json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error writing data file:', error);
        res.status(500).json({ error: 'Failed to write data file' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Troškovnik server running at http://localhost:${PORT}`);
});
