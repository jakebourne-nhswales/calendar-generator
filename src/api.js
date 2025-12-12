const fs = require('fs');
const express = require('express');
const multer = require('multer');
const path = require('path');

const Events = require('./events');
const Themes = require('./themes');

const { generatePDF, generateHTML } = require('./calendar-generator');


// ============================================================================
// API SERVER
// ============================================================================
/**
 * Create and configure API server
 * @param {number} port - Port to listen on
 * @returns {object} Express app instance
 */
function createAPIServer(port = 3000) {
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
  
  // Create temp directory if it doesn't exist
  const tempDir = path.join(__dirname, 'temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
  
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      service: 'Calendar Generator API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  });
  
  // List available options endpoint
  app.get('/api/options', (req, res) => {
    res.json({
      themes: Themes.getThemeNames(),
      layouts: Object.keys(LAYOUTS),
      pageSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'],
      formats: ['pdf', 'html'],
      logoPositions: ['header', 'footer', 'auto'],
      logoAlignments: ['left', 'center', 'right']
    });
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
        format = 'pdf',
        logoPosition = 'auto',
        logoAlign = 'right'
      } = req.query;
      
      const monthNum = parseInt(month) - 1;
      const yearNum = parseInt(year);
      
      // Validate parameters
      if (monthNum < 0 || monthNum > 11) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
      }
      
      if (!LAYOUTS[layout]) {
        return res.status(400).json({ 
          error: `Invalid layout. Available: ${Object.keys(LAYOUTS).join(', ')}` 
        });
      }
      
      const options = {
        theme,
        layout: LAYOUTS[layout],
        pageSize,
        withImage: false,
        imagePath: null,
        logoPath: null,
        logoPosition,
        logoAlign
      };
      
      if (format === 'html') {
        const html = generateHTML(monthNum, yearNum, options);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        const timestamp = Date.now();
        const filename = `calendar-${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${timestamp}.pdf`;
        const outputPath = path.join(tempDir, filename);
        
        await generatePDF(monthNum, yearNum, { ...options, outputPath });
        
        res.download(outputPath, filename, (err) => {
          if (err) console.error('Error sending file:', err);
          setTimeout(() => {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            const htmlPath = outputPath.replace('.pdf', '.html');
            if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
          }, 1000);
        });
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // POST endpoint - Generate calendar with JSON payload and file uploads
  app.post('/api/calendar', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const {
        year = new Date().getFullYear(),
        month = new Date().getMonth() + 1,
        layout = 'fortnight',
        theme = 'default',
        pageSize = 'A4-portrait',
        format = 'pdf',
        events = null,
        logoPosition = 'auto',
        logoAlign = 'right'
      } = req.body;
      
      const monthNum = parseInt(month) - 1;
      const yearNum = parseInt(year);
      
      // Validate parameters
      if (monthNum < 0 || monthNum > 11) {
        return res.status(400).json({ error: 'Month must be between 1 and 12' });
      }
      
      if (!LAYOUTS[layout]) {
        return res.status(400).json({ 
          error: `Invalid layout. Available: ${Object.keys(LAYOUTS).join(', ')}` 
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
        layout: LAYOUTS[layout],
        pageSize,
        withImage: false,
        imagePath: null,
        logoPath: null,
        logoPosition,
        logoAlign
      };
      
      // Handle uploaded image
      let tempImagePath = null;
      if (req.files && req.files['image']) {
        const timestamp = Date.now();
        const ext = path.extname(req.files['image'][0].originalname) || '.jpg';
        tempImagePath = path.join(tempDir, `image-${timestamp}${ext}`);
        fs.writeFileSync(tempImagePath, req.files['image'][0].buffer);
        options.withImage = true;
        options.imagePath = tempImagePath;
      }
      
      // Handle uploaded logo
      let tempLogoPath = null;
      if (req.files && req.files['logo']) {
        const timestamp = Date.now();
        const ext = path.extname(req.files['logo'][0].originalname) || '.png';
        tempLogoPath = path.join(tempDir, `logo-${timestamp}${ext}`);
        fs.writeFileSync(tempLogoPath, req.files['logo'][0].buffer);
        options.logoPath = tempLogoPath;
      }
      
      if (format === 'html') {
        const html = generateHTML(monthNum, yearNum, options);
        
        // Clean up temp files
        if (tempImagePath && fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
        if (tempLogoPath && fs.existsSync(tempLogoPath)) fs.unlinkSync(tempLogoPath);
        
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        const timestamp = Date.now();
        const filename = `calendar-${yearNum}-${String(monthNum + 1).padStart(2, '0')}-${timestamp}.pdf`;
        const outputPath = path.join(tempDir, filename);
        
        await generatePDF(monthNum, yearNum, { ...options, outputPath });
        
        res.download(outputPath, filename, (err) => {
          if (err) console.error('Error sending file:', err);
          setTimeout(() => {
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            const htmlPath = outputPath.replace('.pdf', '.html');
            if (fs.existsSync(htmlPath)) fs.unlinkSync(htmlPath);
            if (tempImagePath && fs.existsSync(tempImagePath)) fs.unlinkSync(tempImagePath);
            if (tempLogoPath && fs.existsSync(tempLogoPath)) fs.unlinkSync(tempLogoPath);
          }, 1000);
        });
      }
    } catch (error) {
      console.error('Error generating calendar:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  return app;
}

/**
 * Start API server
 */
function startServer(port = 3000) {
  const app = createAPIServer(port);
  
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
  POST /api/calendar            - Generate calendar (JSON + files)

Examples:
  GET  http://localhost:${port}/api/calendar?year=2025&month=12&theme=ocean
  POST http://localhost:${port}/api/calendar (with JSON body)

Documentation: See README.md for full API details
    `);
  });
  
  return app;
}

module.exports = { createAPIServer, startServer };


// Run if called directly
if (require.main === module) {
  const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
  startServer(port);
}


