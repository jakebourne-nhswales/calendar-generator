// layouts/year.js
// Year overview with 12 mini monthly grids

const Utils = require('../utils');
const Events = require('../events');

const YearLayout = {
  name: 'Year',
  supportedSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'],
  
  /**
   * Generate a single mini month grid
   */
  generateMiniMonth(month, year) {
    const weeks = Utils.getWeeksInMonth(year, month);
    const today = new Date();
    
    let html = `<div class="mini-month">
      <div class="mini-month-header">${Utils.monthNames[month]}</div>
      <div class="mini-grid">
        <div class="mini-day-headers">`;
    
    // Abbreviated day names
    const shortDayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    shortDayNames.forEach(day => {
      html += `<div class="mini-day-header">${day}</div>`;
    });
    
    html += '</div><div class="mini-weeks">';
    
    // Week rows
    weeks.forEach(week => {
      html += '<div class="mini-week">';
      week.forEach((day, idx) => {
        if (!day) {
          html += '<div class="mini-day empty"></div>';
        } else {
          const currentDate = new Date(year, month, day);
          const dayOfWeek = currentDate.getDay();
          let classes = 'mini-day';
          
          if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
          if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
            classes += ' today';
          }
          
          // Check for events
          const dateKey = Utils.formatDateKey(month, day);
          if (Events.events[dateKey]) {
            classes += ' has-event';
          }
          
          html += `<div class="${classes}">${day}</div>`;
        }
      });
      html += '</div>';
    });
    
    html += '</div></div></div>';
    return html;
  },
  
  /**
   * Generate the full year layout
   */
  generateLayout(month, year, options = {}) {
    let html = '<div class="year-grid">';
    
    // Generate all 12 months
    for (let m = 0; m < 12; m++) {
      html += this.generateMiniMonth(m, year);
    }
    
    html += '</div>';
    return html;
  },
  
  /**
   * Get CSS for this layout
   */
  getCSS(pageSize = 'A4-portrait') {
    const isPortrait = pageSize.includes('portrait');
    
    // Portrait: 3 columns × 4 rows
    // Landscape: 4 columns × 3 rows
    const columns = isPortrait ? 3 : 4;
    const rows = isPortrait ? 4 : 3;
    
    const sizeConfig = {
      'A4-portrait': {
        monthPadding: '8px',
        headerSize: '14px',
        dayHeaderSize: '9px',
        daySize: '11px',
        cellSize: '22px',
        headerMargin: '6px'
      },
      'A4-landscape': {
        monthPadding: '6px',
        headerSize: '13px',
        dayHeaderSize: '8px',
        daySize: '10px',
        cellSize: '20px',
        headerMargin: '5px'
      },
      'A5-portrait': {
        monthPadding: '4px',
        headerSize: '11px',
        dayHeaderSize: '7px',
        daySize: '9px',
        cellSize: '16px',
        headerMargin: '4px'
      },
      'A5-landscape': {
        monthPadding: '3px',
        headerSize: '10px',
        dayHeaderSize: '6px',
        daySize: '8px',
        cellSize: '14px',
        headerMargin: '3px'
      }
    };
    
    const config = sizeConfig[pageSize] || sizeConfig['A4-portrait'];
    
    return `
      .year-grid {
        display: grid;
        grid-template-columns: repeat(${columns}, 1fr);
        grid-template-rows: repeat(${rows}, 1fr);
        gap: 10px;
        height: 100%;
        min-height: 0;
        padding: 5px;
      }
      
      .mini-month {
        border: 2px solid var(--border-color);
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        background: white;
      }
      
      .mini-month-header {
        background: var(--primary-color);
        color: white;
        text-align: center;
        padding: ${config.monthPadding};
        font-weight: 700;
        font-size: ${config.headerSize};
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .mini-grid {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 4px;
      }
      
      .mini-day-headers {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        margin-bottom: ${config.headerMargin};
      }
      
      .mini-day-header {
        text-align: center;
        font-weight: 700;
        font-size: ${config.dayHeaderSize};
        color: var(--secondary-color);
        padding: 2px 0;
      }
      
      .mini-weeks {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .mini-week {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        flex: 1;
        gap: 1px;
      }
      
      .mini-day {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${config.daySize};
        font-weight: 500;
        color: var(--text-color);
        min-height: ${config.cellSize};
        border-radius: 2px;
        position: relative;
      }
      
      .mini-day.empty {
        background: transparent;
      }
      
      .mini-day.weekend {
        color: var(--accent-color);
      }
      
      .mini-day.today {
        background: var(--today-bg);
        border: 1px solid var(--accent-color);
        font-weight: 700;
      }
      
      .mini-day.has-event::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--secondary-color);
      }
      
      .mini-day.has-event.today::after {
        background: var(--accent-color);
      }
    `;
  }
};

module.exports = YearLayout;
