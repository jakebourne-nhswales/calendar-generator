// calendar-generator.js
// Install dependencies: npm install puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Sample events - customize as needed
const events = {
  '2025-11-05': {
    type: 'birthday',
    lines: ["Sarah's Birthday", "Cake at noon", ""]
  },
  '2025-11-14': {
    type: 'anniversary',
    lines: ["Wedding Anniversary", "Dinner reservation 7pm", ""]
  },
  '2025-11-25': {
    type: 'public',
    lines: ["Christmas Day", "Family gathering", ""]
  }
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateHTML(month, year, theme = '') {
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  function generateFortnight(fortnightNum) {
    const startDay = fortnightNum === 1 ? 1 : 16;
    const endDay = fortnightNum === 1 ? 15 : daysInMonth;
    const today = new Date();
    let html = '';
    
    for (let day = startDay; day <= endDay; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      const dayName = dayNames[dayOfWeek];
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      let classes = 'day-card';
      if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
      if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
        classes += ' today';
      }
      
      let eventHTML = '';
      if (events[dateKey]) {
        const eventLines = events[dateKey].lines
          .filter(line => line.trim())
          .map(line => `<div class="event-line ${events[dateKey].type}">${line}</div>`)
          .join('');
        eventHTML = `<div class="events-card">${eventLines}</div>`;
      }
      
      html += `
        <div class="${classes}">
          <div class="day-info">
            <div class="day-name">${dayName}</div>
            <div class="day-number">${day}</div>
          </div>
          <div class="day-content">${eventHTML}</div>
        </div>
      `;
    }
    
    return html;
  }
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${monthNames[month]} ${year} Calendar</title>
    <style>
        :root {
            --primary-color: #2c3e50;
            --secondary-color: #3498db;
            --accent-color: #e74c3c;
            --background-color: #ffffff;
            --text-color: #2c3e50;
            --border-color: #bdc3c7;
            --header-bg: #34495e;
            --header-text: #ffffff;
            --weekend-bg: #ecf0f1;
            --today-bg: #fff3cd;
        }

        .theme-ocean {
            --primary-color: #006994;
            --secondary-color: #00a8cc;
            --accent-color: #f39c12;
            --background-color: #f8f9fa;
            --text-color: #2c3e50;
            --border-color: #81c7d4;
            --header-bg: #005073;
            --header-text: #ffffff;
            --weekend-bg: #e8f4f8;
            --today-bg: #d4edda;
        }

        .theme-sunset {
            --primary-color: #c0392b;
            --secondary-color: #e67e22;
            --accent-color: #f39c12;
            --background-color: #fef5e7;
            --text-color: #2c3e50;
            --border-color: #f39c12;
            --header-bg: #d35400;
            --header-text: #ffffff;
            --weekend-bg: #fdebd0;
            --today-bg: #ffe5cc;
        }

        .theme-minimalist {
            --primary-color: #000000;
            --secondary-color: #555555;
            --accent-color: #000000;
            --background-color: #ffffff;
            --text-color: #000000;
            --border-color: #cccccc;
            --header-bg: #f5f5f5;
            --header-text: #000000;
            --weekend-bg: #fafafa;
            --today-bg: #e8e8e8;
        }

        @page {
            size: A4;
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

        .calendar-container {
            width: 210mm;
            height: 297mm;
            background: var(--background-color);
            padding: 15mm;
        }

        .calendar-header {
            text-align: center;
            margin-bottom: 15px;
            padding: 15px;
            background: var(--header-bg);
            color: var(--header-text);
            border-radius: 8px;
        }

        .calendar-header h1 {
            font-size: 28px;
            margin-bottom: 3px;
        }

        .calendar-header .year {
            font-size: 16px;
            opacity: 0.9;
        }

        .fortnights {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            height: calc(100% - 100px);
        }

        .fortnight {
            border: 2px solid var(--border-color);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .days-grid {
            display: flex;
            flex-direction: column;
            flex: 1;
            gap: 2px;
            padding: 8px;
            overflow: hidden;
        }

        .day-card {
            display: flex;
            align-items: center;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 8px 12px;
            background: white;
            min-height: 48px;
            transition: all 0.2s ease;
        }

        .day-card.weekend {
            background-color: var(--weekend-bg);
        }

        .day-card.today {
            background-color: var(--today-bg);
            border: 2px solid var(--accent-color);
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .day-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 2px;
            flex-shrink: 0;
            min-width: 50px;
        }

        .day-name {
            font-weight: 700;
            font-size: 11px;
            color: var(--secondary-color);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .day-number {
            font-weight: 700;
            font-size: 22px;
            color: var(--primary-color);
            line-height: 1;
        }

        .day-card.weekend .day-name {
            color: var(--accent-color);
        }

        .day-card.weekend .day-number {
            color: var(--accent-color);
        }

        .day-content {
            flex: 1;
            margin-left: 12px;
            display: flex;
            justify-content: flex-end;
        }

        .events-card {
            background: rgba(0,0,0,0.02);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 5px 10px;
            max-width: 70%;
            min-width: 190px;
        }

        .event-line {
            font-size: 11px;
            font-style: italic;
            color: var(--text-color);
            opacity: 0.8;
            line-height: 1.4;
            margin-bottom: 2px;
        }

        .event-line:last-child {
            margin-bottom: 0;
        }

        .event-line.birthday {
            color: #e91e63;
        }

        .event-line.anniversary {
            color: #9c27b0;
        }

        .event-line.public {
            color: #2196f3;
        }

        .event-line.custom {
            color: #ff9800;
        }

        .day-card.weekend .events-card {
            background: rgba(255,255,255,0.5);
        }
    </style>
</head>
<body>
    <div class="calendar-container ${theme}">
        <div class="calendar-header">
            <h1>${monthNames[month]}</h1>
            <div class="year">${year}</div>
        </div>

        <div class="fortnights">
            <div class="fortnight">
                <div class="days-grid">${generateFortnight(1)}</div>
            </div>

            <div class="fortnight">
                <div class="days-grid">${generateFortnight(2)}</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

async function generatePDF(month, year, theme = '', outputPath = null) {
  const html = generateHTML(month, year, theme);
  
  // Save HTML file
  const htmlPath = outputPath ? outputPath.replace('.pdf', '.html') : 
                   `calendar-${year}-${String(month + 1).padStart(2, '0')}.html`;
  fs.writeFileSync(htmlPath, html);
  console.log(`HTML saved to: ${htmlPath}`);
  
  // Generate PDF
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdfPath = outputPath || `calendar-${year}-${String(month + 1).padStart(2, '0')}.pdf`;
  await page.pdf({
    path: pdfPath,
    format: 'A4',
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

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const month = args[0] ? parseInt(args[0]) - 1 : new Date().getMonth();
  const year = args[1] ? parseInt(args[1]) : new Date().getFullYear();
  const theme = args[2] || '';
  
  console.log(`Generating calendar for ${monthNames[month]} ${year}...`);
  generatePDF(month, year, theme)
    .then(({ htmlPath, pdfPath }) => {
      console.log('Calendar generation complete!');
    })
    .catch(err => {
      console.error('Error generating calendar:', err);
      process.exit(1);
    });
}

module.exports = { generateHTML, generatePDF };