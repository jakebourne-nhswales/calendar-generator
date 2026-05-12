// calendar-generator.js
// Install dependencies: npm install puppeteer

const puppeteer = require('puppeteer-core');
const fs = require('fs');

const Utils = require('./utils');
const Events = require('./events');
const Themes = require('./themes');


// ============================================================================
// HTML GENERATOR
// ============================================================================
/**
 * Generate complete HTML document for calendar
 * @param {number} month - Month index (0-11)
 * @param {number} year - Full year
 * @param {object} options - Configuration options
 * @returns {string} Complete HTML document
 */
function generateHTML(month, year, options = {}) {
  const {
    theme = 'default',
    layout = null, // Pass layout object directly
    pageSize = 'A4-portrait',
    withImage = false,
    imagePath = null,
    logoPath = null,
    logoPosition = 'auto',
    logoAlign = 'right',
    imageDimensions = null,
    facingPages = false // NEW: Enable facing page spread layout
  } = options;
  
  if (!layout) {
    throw new Error('Layout object is required');
  }
  
  const themeClass = theme === 'default' ? '' : `theme-${theme}`;
  
  // Page size configurations
  // NEW: Added A3 sizes for double-page spreads
  const pageSizes = {
    'A4-portrait': { width: '210mm', height: '297mm' },
    'A4-landscape': { width: '297mm', height: '210mm' },
    'A5-portrait': { width: '148mm', height: '210mm' },
    'A5-landscape': { width: '210mm', height: '148mm' },
    'A3-landscape': { width: '420mm', height: '297mm' }, // NEW: Two A4 pages side-by-side
    'A3-portrait': { width: '297mm', height: '420mm' }     // NEW: Two A4 pages stacked
  };
  
  let size = pageSizes[pageSize] || pageSizes['A4-portrait'];
  
  // NEW: Auto-adjust to A3 landscape if facing pages with image
  let finalPageSize = pageSize;
  if (withImage && imagePath && facingPages) {
    finalPageSize = 'A3-landscape';
    size = pageSizes['A3-landscape'];
  }
  
  // Determine logo placement
  let finalLogoPosition = logoPosition;
  if (logoPosition === 'auto') {
    finalLogoPosition = (layout.name === 'Year') ? 'footer' : 'header';
  }
  
  // Process logo if provided
  let logoHTML = '';
  if (logoPath) {
    try {
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = logoBuffer.toString('base64');
      
      const ext = logoPath.toLowerCase().split('.').pop();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'webp': 'image/webp'
      };
      const mimeType = mimeTypes[ext] || 'image/png';
      
      if (finalLogoPosition === 'header') {
        const alignClass = `logo-align-${logoAlign}`;
        logoHTML = `<img src="data:${mimeType};base64,${logoBase64}" alt="Logo" class="header-logo ${alignClass}">`;
      } else {
        logoHTML = `<img src="data:${mimeType};base64,${logoBase64}" alt="Logo" class="footer-logo">`;
      }
    } catch (err) {
      console.error(`Error loading logo: ${err.message}`);
    }
  }
  
  // NEW: Process image for facing pages layout
  let imagePageHTML = '';
  if (withImage && imagePath && facingPages) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      const ext = imagePath.toLowerCase().split('.').pop();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp'
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';
      
      // Half the width for A3 landscape (210mm each for left/right pages)
      const halfWidth = '210mm';
      const pageHeight = '297mm';
      
      imagePageHTML = `
        <div class="image-page-spread" style="width: ${halfWidth}; height: ${pageHeight}; padding: 15mm; box-sizing: border-box; display: flex; align-items: center; justify-content: center;">
          <img src="data:${mimeType};base64,${imageBase64}" alt="Calendar image ${year}-${month}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;">
        </div>
      `;
    } catch (err) {
      console.error(`Error loading image: ${err.message}`);
    }
  } 
  // ORIGINAL: Process image as separate page if not facing pages layout
  else if (withImage && imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');

      const ext = imagePath.toLowerCase().split('.').pop();
      const mimeTypes = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'bmp': 'image/bmp'
      };
      const mimeType = mimeTypes[ext] || 'image/jpeg';
      
      imagePageHTML = `
        <div class="image-page" style="width: ${size.width}; height: ${size.height}; padding: 15mm; box-sizing: border-box;">
          <img src="data:${mimeType};base64,${imageBase64}" alt="Calendar image ${year}-${month}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;">
        </div>
        <div style="page-break-after: always;"></div>
      `;
    } catch (err) {
      console.error(`Error loading image: ${err.message}`);
    }
  }
  
  // Build HTML document
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Utils.monthNames[month]} ${year} Calendar</title>
    <style>
        @page {
            size: ${size.width} ${size.height};
            margin: 0; /* Changed to 0 for spread layout */
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: var(--font-family);
            color: var(--text-color);
        }

        /* NEW: Facing pages spread container */
        .facing-pages-spread {
            display: flex;
            width: ${size.width};
            height: ${size.height};
            background: var(--background-color);
            page-break-inside: avoid; /* Keep spread together */
        }

        .spread-left-page {
            width: 50%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f0f0f0;
            border-right: 1px solid #ddd; /* Visual separator */
        }

        .spread-right-page {
            width: 50%;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 15mm;
            overflow: hidden;
        }

        .image-page {
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
        }

        /* NEW: Image within spread */
        .image-page-spread {
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .calendar-container {
            width: ${size.width};
            height: ${size.height};
            background: var(--background-color);
            padding: 15mm;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
        }

        /* NEW: Calendar container within spread */
        .calendar-container.spread-variant {
            width: 100%;
            height: 100%;
            padding: 15mm;
            background: transparent;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding: 12px 20px;
            background: var(--header-bg);
            color: var(--header-text);
            border-radius: 8px;
            position: relative;
        }

        .header-logo {
            max-height: 45px;
            max-width: 100px;
            object-fit: contain;
        }

        .header-logo.logo-align-right {
            position: absolute;
            right: 20px;
            top: 50%;
            transform: translateY(-50%);
        }

        .header-logo.logo-align-left {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
        }

        .header-logo.logo-align-center {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        .calendar-header.with-logo-right {
            padding-right: 130px;
        }

        .calendar-header.with-logo-left {
            padding-left: 130px;
        }

        .calendar-header.with-logo-left .calendar-header-content {
            margin-left: auto;
        }

        .calendar-header-content {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            flex: 1;
            gap: 20px;
        }

        .calendar-header h1 {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
        }

        .calendar-header .year {
            font-size: 36px;
            font-weight: 700;
            margin: 0;
        }

        .calendar-content {
            display: flex;
            flex-direction: column;
            min-height: 0;
        }

        .calendar-footer {
            margin-top: 6px;
            padding: 8px 20px;
            display: flex;
            align-items: center;
            flex-shrink: 0;
            min-height: 50px;
            background: var(--header-bg);
            color: var(--header-text);
            border-radius: 8px; 
        }

        .calendar-footer.logo-align-left {
            justify-content: flex-start;
        }

        .calendar-footer.logo-align-center {
            justify-content: center;
        }

        .calendar-footer.logo-align-right {
            justify-content: flex-end;
        }

        .footer-logo {
            max-height: 25px;
            max-width: 100px;
            object-fit: contain;
        }

        ${Themes.getAllThemesCSS()}
        ${layout.getCSS(finalPageSize)} /* NEW: Use finalPageSize */
    </style>
</head>
<body>
    <!-- NEW: Facing pages spread layout -->
    ${withImage && imagePath && facingPages ? `
    <div class="facing-pages-spread">
        <div class="spread-left-page">
            ${imagePageHTML}
        </div>
        <div class="spread-right-page">
            <div class="calendar-container spread-variant ${themeClass}">
                <div class="calendar-header ${finalLogoPosition === 'header' && logoHTML ? 'with-logo-' + logoAlign : ''}">
                    ${finalLogoPosition === 'header' && logoAlign === 'left' ? logoHTML : ''}
                    <div class="calendar-header-content">
                        <h1>${Utils.monthNames[month]}</h1>
                        <div class="year">${year}</div>
                    </div>
                    ${finalLogoPosition === 'header' && (logoAlign === 'right' || logoAlign === 'center') ? logoHTML : ''}
                </div>
                <div class="calendar-content">
                    ${layout.generateLayout(month, year, { ...options, pageSize: finalPageSize })}
                </div>
                ${finalLogoPosition === 'footer' && logoHTML ? `<div class="calendar-footer logo-align-${logoAlign}">${logoHTML}</div>` : ''}
            </div>
        </div>
    </div>
    ` : `
    <!-- ORIGINAL: Single page layout -->
    ${imagePageHTML}
    <div class="calendar-container ${themeClass}">
        <div class="calendar-header ${finalLogoPosition === 'header' && logoHTML ? 'with-logo-' + logoAlign : ''}">
            ${finalLogoPosition === 'header' && logoAlign === 'left' ? logoHTML : ''}
            <div class="calendar-header-content">
                <h1>${Utils.monthNames[month]}</h1>
                <div class="year">${year}</div>
            </div>
            ${finalLogoPosition === 'header' && (logoAlign === 'right' || logoAlign === 'center') ? logoHTML : ''}
        </div>
        <div class="calendar-content">
            ${layout.generateLayout(month, year, options)}
        </div>
        ${finalLogoPosition === 'footer' && logoHTML ? `<div class="calendar-footer logo-align-${logoAlign}">${logoHTML}</div>` : ''}
    </div>
    `}
</body>
</html>`;
}


// pdfGenerator.js
// Generate PDF from HTML using Puppeteer Core

/**
 * Find Chrome executable path
 * Supports multiple environments (local, Docker, serverless)
 */
function findChrome() {
  // Check environment variable first (allows custom configuration)
  if (process.env.CHROME_BIN) {
    return process.env.CHROME_BIN;
  }

  // Common Chrome paths for different operating systems
  const chromePaths = [
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    // Docker/Alpine common locations
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser'
  ];

  // Find first existing Chrome executable
  for (const chromePath of chromePaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath;
    }
  }

  // If no Chrome found, throw helpful error
  throw new Error(
      'Chrome executable not found. Please install Chrome/Chromium or set CHROME_BIN environment variable.\n' +
      'For Docker: Install chromium package\n' +
      'For AWS Lambda: Use chrome-aws-lambda package'
  );
}

/**
 * Generate PDF calendar
 * @param {number} month - Month index (0-11)
 * @param {number} year - Full year
 * @param {object} options - Configuration options
 * @returns {Promise<object>} Paths to generated files
 */
async function generatePDF(month, year, options = {}) {
  const {
    theme = 'default',
    layout = null, // Pass layout object directly
    pageSize = 'A4-portrait',
    outputPath = null,
    eventsFile = null,
    withImage = false,
    imagePath = null,
    logoPath = null,
    logoPosition = 'auto',
    logoAlign = 'right',
    facingPages = false, // NEW: Enable facing page spread
    executablePath = null // Allow override of Chrome path
  } = options;

  if (!layout) {
    throw new Error('Layout object is required');
  }

  // Preload image dimensions
  let imageDimensions = null;
  if (withImage && imagePath) {
    /*try {
      imageDimensions = await Utils.getImageDimensions(imagePath);
    } catch (err) {
      console.error(`Error loading image dimensions: ${err.message}`);
    }*/
  }

  // Load events if specified
  if (eventsFile) {
    Events.loadEventsFromFile(eventsFile);
  }

  // Generate HTML
  const html = generateHTML(month, year, {
    theme,
    layout,
    pageSize,
    withImage,
    imagePath,
    logoPath,
    logoPosition,
    logoAlign,
    facingPages, // NEW: Pass facing pages option
    imageDimensions
  });

  // Save HTML file
  const htmlPath = outputPath ? outputPath.replace('.pdf', '.html') :
      `calendar-${year}-${String(month + 1).padStart(2, '0')}.html`;
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved to: ${htmlPath}`);

  // Find Chrome executable
  const chromePath = executablePath || findChrome();
  console.log(`Using Chrome at: ${chromePath}`);

  // Generate PDF with Puppeteer Core
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Overcome limited resource problems in containers
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  // NEW: Determine PDF format based on facing pages layout
  let pdfFormat = pageSize;
  if (withImage && imagePath && facingPages) {
    pdfFormat = 'A3-landscape';
  }

  // Determine PDF format based on pageSize
  const formatMap = {
    'A4-portrait': { format: 'A4', landscape: false },
    'A4-landscape': { format: 'A4', landscape: true },
    'A5-portrait': { format: 'A5', landscape: false },
    'A5-landscape': { format: 'A5', landscape: true },
    'A3-landscape': { format: 'A3', landscape: true },
    'A3-portrait': { format: 'A3', landscape: false }
  };

  const pdfConfig = formatMap[pdfFormat] || formatMap['A4-portrait'];

  const pdfPath = outputPath || `calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`;
  await page.pdf({
    path: pdfPath,
    format: pdfConfig.format,
    landscape: pdfConfig.landscape,
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    }
  });

  await browser.close();
  console.log(`PDF saved to: ${pdfPath}`);

  return { htmlPath, pdfPath };
}


module.exports = { 
  generateHTML, 
  generatePDF
};
