// calendar-generator.js
// Install dependencies: npm install puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');

const Utils = require('./utils');
const Events = require('./events');
const Themes = require('./themes');
const Layouts = require('./layouts');


// ============================================================================
// HTML GENERATOR
// ============================================================================
function generateHTML(month, year, options = {}) {
  const {
    theme = 'default',
    layout = 'fortnight',
    pageSize = 'A4-portrait',
    withImage = false,
    imagePath = null
  } = options;
  
  const layoutObj = Layouts[layout];
  const themeClass = theme === 'default' ? '' : `theme-${theme}`;
  
  // Page size configurations
  const pageSizes = {
    'A4-portrait': { width: '210mm', height: '297mm', orientation: 'portrait' },
    'A4-landscape': { width: '297mm', height: '210mm', orientation: 'landscape' },
    'A5-portrait': { width: '148mm', height: '210mm', orientation: 'portrait' },
    'A5-landscape': { width: '210mm', height: '148mm', orientation: 'landscape' }
  };
  
  const size = pageSizes[pageSize] || pageSizes['A4-portrait'];
  
  // Image page HTML with base64 encoding
  let imagePageHTML = '';
  if (withImage && imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const imageBase64 = imageBuffer.toString('base64');
      
      // Determine MIME type from file extension
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
          <img src="data:${mimeType};base64,${imageBase64}" alt="Calendar image" style="width: 100%; height: 100%; object-fit: contain; border-radius: 4px;">
        </div>
        <div style="page-break-after: always;"></div>
      `;
    } catch (err) {
      console.error(`Error loading image: ${err.message}`);
      imagePageHTML = '';
    }
  }

  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${Utils.monthNames[month]} ${year} Calendar</title>
    <style>
        @page {
            size: ${size.width} ${size.height};
            margin: 15mm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: var(--text-color);
        }

        .image-page {
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
        }

        .calendar-container {
            width: ${size.width};
            height: ${size.height};
            background: var(--background-color);
            padding: 15mm;
            margin: 0 auto;
        }

        .calendar-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 15px;
            padding: 15px 20px;
            background: var(--header-bg);
            color: var(--header-text);
            border-radius: 8px;
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

        ${Themes.getAllThemesCSS()}
        ${layoutObj.getCSS(pageSize)}
    </style>
</head>
<body>
    ${imagePageHTML}
    <div class="calendar-container ${themeClass}">
        <div class="calendar-header">
            <h1>${Utils.monthNames[month]}</h1>
            <div class="year">${year}</div>
        </div>
        ${layoutObj.generateLayout(month, year, options)}
    </div>
</body>
</html>`;
}

// ============================================================================
// PDF GENERATOR
// ============================================================================
async function generatePDF(month, year, options = {}) {
  const {
    theme = 'default',
    layout = 'fortnight',
    pageSize = 'A4-portrait',
    outputPath = null,
    eventsFile = null,
    withImage = false,
    imagePath = null
  } = options;
  
  // Load events if specified
  if (eventsFile) {
    Events.loadEventsFromFile(eventsFile);
  }
  
  const html = generateHTML(month, year, {
    theme,
    layout,
    pageSize,
    withImage,
    imagePath
  });
  
  // Save HTML file
  const htmlPath = outputPath ? outputPath.replace('.pdf', '.html') : 
                   `calendar-${year}-${String(month + 1).padStart(2, '0')}.html`;
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved to: ${htmlPath}`);
  
  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  // Determine PDF format based on pageSize
  const formatMap = {
    'A4-portrait': { format: 'A4', landscape: false },
    'A4-landscape': { format: 'A4', landscape: true },
    'A5-portrait': { format: 'A5', landscape: false },
    'A5-landscape': { format: 'A5', landscape: true }
  };
  
  const pdfConfig = formatMap[pageSize] || formatMap['A4-portrait'];
  
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

// ============================================================================
// CLI INTERFACE
// ============================================================================
if (require.main === module) {
  const args = process.argv.slice(2);
  
  // Show help if requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Calendar Generator - Modular Architecture

USAGE:
  node calendar-generator.js [month] [year] [theme] [layout] [pageSize] [options]

ARGUMENTS:
  month       Month number (1-12), default: current month (ignored for year layout)
  year        Year (e.g., 2025), default: current year
  theme       Theme name: default, ocean, sunset, minimalist, darkred
  layout      Layout name: fortnight, weekly, year
  pageSize    Page size: A4-portrait, A4-landscape, A5-portrait, A5-landscape

OPTIONS:
  --events=FILE          Load events from JSON file
  --image=PATH           Add image on facing page
  --output=FILE          Custom output file path

EXAMPLES:
  # Basic usage - current month, default theme and layout
  node calendar-generator.js

  # Specific month and year with theme
  node calendar-generator.js 12 2025 darkred

  # Weekly grid layout with A4 landscape
  node calendar-generator.js 12 2025 ocean weekly A4-landscape

  # With custom events file
  node calendar-generator.js 12 2025 darkred weekly A4-portrait --events=events.json

  # With image on facing page
  node calendar-generator.js 12 2025 ocean fortnight A4-portrait --image=photo.jpg

  # A5 portrait for small planners
  node calendar-generator.js 3 2025 minimalist weekly A5-portrait

SUPPORTED SIZES:
  - A4-portrait (210mm x 297mm)
  - A4-landscape (297mm x 210mm)
  - A5-portrait (148mm x 210mm)
  - A5-landscape (210mm x 148mm)

LAYOUTS:
  - fortnight: Two-column layout (days 1-15, days 16-end)
  - weekly: Traditional calendar grid with weeks
  - year: 12 mini monthly grids (3×4 portrait, 4×3 landscape)

THEMES:
  - default: Professional blue/gray
  - ocean: Cool blues and teals
  - sunset: Warm oranges and yellows
  - minimalist: Clean black and white
  - darkred: Dramatic dark red with pink accents
    `);
    process.exit(0);
  }
  
  // Parse positional arguments
  const month = args[0] && !args[0].startsWith('--') ? parseInt(args[0]) - 1 : new Date().getMonth();
  const year = args[1] && !args[1].startsWith('--') ? parseInt(args[1]) : new Date().getFullYear();
  const theme = args[2] && !args[2].startsWith('--') ? args[2] : 'default';
  const layout = args[3] && !args[3].startsWith('--') ? args[3] : 'fortnight';
  const pageSize = args[4] && !args[4].startsWith('--') ? args[4] : 'A4-portrait';
  
  // Parse options
  const options = {
    theme,
    layout,
    pageSize,
    eventsFile: null,
    imagePath: null,
    withImage: false,
    outputPath: null
  };
  
  args.forEach(arg => {
    if (arg.startsWith('--events=')) {
      options.eventsFile = arg.split('=')[1];
    } else if (arg.startsWith('--image=')) {
      options.imagePath = arg.split('=')[1];
      options.withImage = true;
    } else if (arg.startsWith('--output=')) {
      options.outputPath = arg.split('=')[1];
    }
  });
  
  console.log(`
Generating calendar:
  Month: ${Utils.monthNames[month]} ${year}
  Theme: ${theme}
  Layout: ${layout}
  Page Size: ${pageSize}
  ${options.eventsFile ? 'Events: ' + options.eventsFile : ''}
  ${options.imagePath ? 'Image: ' + options.imagePath : ''}
  `);
  
  generatePDF(month, year, options)
    .then(({ htmlPath, pdfPath }) => {
      console.log('\n✓ Calendar generation complete!');
    })
    .catch(err => {
      console.error('✗ Error generating calendar:', err);
      process.exit(1);
    });
}

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = { 
  generateHTML, 
  generatePDF,
  Utils,
  Themes,
  Layouts,
  Events
};