const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');

const Events = require('./events');
const Themes = require('./themes');
const Layouts = require('./layouts');

const { generatePDF, generateHTML } = require('./calendar-generator');


// ============================================================================
// API SERVER
// ============================================================================
function startAPIServer(port = 3000) {
const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Calendar Generator API' });
});

// GET endpoint - Generate calendar with URL parameters
app.get('/api/calendar', async (req, res) => {
    try {
    const {
        year = new Date().getFullYear(),
        month = new Date().getMonth() + 1,
        layout = 'fortnight',
        theme = 'default',
        pageSize = 'A4-portrait',
        format = 'pdf' // 'pdf' or 'html'
    } = req.query;
    
    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);
    
    // Validate parameters
    if (monthNum < 0 || monthNum > 11) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }
    
    if (!Layouts[layout]) {
        return res.status(400).json({ 
        error: `Invalid layout. Available: ${Object.keys(Layouts).join(', ')}` 
        });
    }
    
    const options = {
        theme,
        layout,
        pageSize,
        withImage: false,
        imagePath: null
    };
    
    if (format === 'html') {
        // Return HTML directly
        const html = generateHTML(monthNum, yearNum, options);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        // Generate PDF
        const timestamp = Date.now();
        const filename = `calendar-${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${timestamp}.pdf`;
        const outputPath = path.join(__dirname, 'temp', filename);
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
        fs.mkdirSync(path.join(__dirname, 'temp'));
        }
        
        await generatePDF(monthNum, yearNum, { ...options, outputPath });
        
        // Send file and clean up
        res.download(outputPath, filename, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
        // Delete temp file after sending
        setTimeout(() => {
            if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            }
            const htmlPath = outputPath.replace('.pdf', '.html');
            if (fs.existsSync(htmlPath)) {
            fs.unlinkSync(htmlPath);
            }
        }, 1000);
        });
    }
    } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({ error: error.message });
    }
});

// POST endpoint - Generate calendar with JSON payload and optional image
app.post('/api/calendar', upload.single('image'), async (req, res) => {
    try {
    const {
        year = new Date().getFullYear(),
        month = new Date().getMonth() + 1,
        layout = 'fortnight',
        theme = 'default',
        pageSize = 'A4-portrait',
        format = 'pdf',
        events = null
    } = req.body;
    
    const monthNum = parseInt(month) - 1;
    const yearNum = parseInt(year);
    
    // Validate parameters
    if (monthNum < 0 || monthNum > 11) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
    }
    
    if (!Layouts[layout]) {
        return res.status(400).json({ 
        error: `Invalid layout. Available: ${Object.keys(Layouts).join(', ')}` 
        });
    }
    
    // Load events if provided
    if (events) {
        try {
        const eventsData = typeof events === 'string' ? JSON.parse(events) : events;
        Events.events = eventsData;
        } catch (err) {
        return res.status(400).json({ error: 'Invalid events JSON format' });
        }
    }
    
    const options = {
        theme,
        layout,
        pageSize,
        withImage: false,
        imagePath: null
    };
    
    // Handle uploaded image
    let tempImagePath = null;
    if (req.file) {
        const timestamp = Date.now();
        const ext = path.extname(req.file.originalname) || '.jpg';
        tempImagePath = path.join(__dirname, 'temp', `image-${timestamp}${ext}`);
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(path.join(__dirname, 'temp'))) {
        fs.mkdirSync(path.join(__dirname, 'temp'));
        }
        
        fs.writeFileSync(tempImagePath, req.file.buffer);
        options.withImage = true;
        options.imagePath = tempImagePath;
    }
    
    if (format === 'html') {
        // Return HTML directly
        const html = generateHTML(monthNum, yearNum, options);
        
        // Clean up temp image
        if (tempImagePath && fs.existsSync(tempImagePath)) {
        fs.unlinkSync(tempImagePath);
        }
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } else {
        // Generate PDF
        const timestamp = Date.now();
        const filename = `calendar-${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${timestamp}.pdf`;
        const outputPath = path.join(__dirname, 'temp', filename);
        
        await generatePDF(monthNum, yearNum, { ...options, outputPath });
        
        // Send file and clean up
        res.download(outputPath, filename, (err) => {
        if (err) {
            console.error('Error sending file:', err);
        }
        // Delete temp files after sending
        setTimeout(() => {
            if (fs.existsSync(outputPath)) {
            fs.unlinkSync(outputPath);
            }
            const htmlPath = outputPath.replace('.pdf', '.html');
            if (fs.existsSync(htmlPath)) {
            fs.unlinkSync(htmlPath);
            }
            if (tempImagePath && fs.existsSync(tempImagePath)) {
            fs.unlinkSync(tempImagePath);
            }
        }, 1000);
        });
    }
    } catch (error) {
    console.error('Error generating calendar:', error);
    res.status(500).json({ error: error.message });
    }
});

// GET endpoint - List available themes and layouts
app.get('/api/options', (req, res) => {
    res.json({
    themes: Object.keys(Themes).filter(key => key !== 'getAllThemesCSS'),
    layouts: Object.keys(Layouts),
    pageSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'],
    formats: ['pdf', 'html']
    });
});

app.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Calendar Generator API Server                     ║
║         Running on http://localhost:${port}                  ║
╚═══════════════════════════════════════════════════════════╝

Available Endpoints:
GET  /health                  - Health check
GET  /api/options             - List available options
GET  /api/calendar            - Generate calendar (URL params)
POST /api/calendar            - Generate calendar (JSON payload)

Examples:
GET  http://localhost:${port}/api/calendar?year=2025&month=12&theme=ocean&layout=weekly
POST http://localhost:${port}/api/calendar (with JSON body)

See documentation for full API details.
    `);
});

return app;
}


if (require.main === module) {
    const args = process.argv.slice(2);
    const port = args[0] ? parseInt(args[0]) : 3000;
    startAPIServer(port);
}
