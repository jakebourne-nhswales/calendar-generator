// layouts/weekly.js
// Traditional weekly grid calendar layout

const Utils = require('../utils');
const Events = require('../events');

const WeeklyLayout = {
  name: 'Weekly',
  supportedSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'],
  
  /**
   * Generate a single day cell
   */
  generateDayCell(day, month, year) {
    if (!day) {
      return '<div class="week-day empty"></div>';
    }
    
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const dateKey = Utils.formatDateKey(month, day);
    const today = new Date();
    
    let classes = 'week-day';
    if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
    if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
      classes += ' today';
    }
    
    const eventHTML = Events.getEventHTML(dateKey, year);
    
    return `
      <div class="${classes}">
        <div class="week-day-number">${day}</div>
        <div class="week-day-events">${eventHTML}</div>
      </div>
    `;
  },
  
  /**
   * Generate the full layout
   */
  generateLayout(month, year, options = {}) {
    const weeks = Utils.getWeeksInMonth(year, month);
    
    let html = '<div class="weekly-grid">';
    
    // Day headers
    html += '<div class="week-headers">';
    Utils.dayNames.forEach(dayName => {
      html += `<div class="week-header">${dayName}</div>`;
    });
    html += '</div>';
    
    // Week rows
    weeks.forEach(week => {
      html += '<div class="week-row">';
      week.forEach(day => {
        html += this.generateDayCell(day, month, year);
      });
      html += '</div>';
    });
    
    html += '</div>';
    return html;
  },
  
  /**
   * Get CSS for this layout
   */
  getCSS(pageSize = 'A4-portrait') {
    const sizeConfig = {
      'A4-portrait': {
        cellHeight: '80px',
        fontSize: '10px',
        dayNumSize: '18px',
        eventPadding: '4px',
        headerSize: '12px'
      },
      'A4-landscape': {
        cellHeight: '100px',
        fontSize: '11px',
        dayNumSize: '20px',
        eventPadding: '6px',
        headerSize: '13px'
      },
      'A5-portrait': {
        cellHeight: '50px',
        fontSize: '8px',
        dayNumSize: '14px',
        eventPadding: '2px',
        headerSize: '10px'
      },
      'A5-landscape': {
        cellHeight: '42px',
        fontSize: '7px',
        dayNumSize: '12px',
        eventPadding: '2px',
        headerSize: '9px'
      }
    };
    
    const config = sizeConfig[pageSize] || sizeConfig['A4-portrait'];
    
    return `
      .weekly-grid {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
        border: 2px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
      }
      
      .week-headers {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        background: var(--primary-color);
        border-bottom: 2px solid var(--border-color);
      }
      
      .week-header {
        padding: 6px;
        text-align: center;
        font-weight: 700;
        font-size: ${config.headerSize};
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        border-right: 1px solid rgba(255,255,255,0.2);
      }
      
      .week-header:last-child {
        border-right: none;
      }
      
      .week-row {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        flex: 1;
      }
      
      .week-day {
        border: 1px solid var(--border-color);
        padding: ${config.eventPadding};
        background: white;
        display: flex;
        flex-direction: column;
        min-height: ${config.cellHeight};
        position: relative;
      }
      
      .week-day.empty {
        background: #f5f5f5;
      }
      
      .week-day.weekend {
        background-color: var(--weekend-bg);
      }
      
      .week-day.today {
        background-color: var(--today-bg);
        border: 2px solid var(--accent-color);
        box-shadow: inset 0 0 8px rgba(0,0,0,0.1);
      }
      
      .week-day-number {
        font-weight: 700;
        font-size: ${config.dayNumSize};
        color: var(--primary-color);
        margin-bottom: 2px;
      }
      
      .week-day.weekend .week-day-number {
        color: var(--accent-color);
      }
      
      .week-day-events {
        flex: 1;
        overflow: hidden;
      }
      
      .week-day-events .events-card {
        background: transparent;
        border: none;
        padding: 0;
        min-width: auto;
        max-width: 100%;
      }
      
      .week-day-events .event-line {
        font-size: ${config.fontSize};
        line-height: 1.2;
        margin-bottom: 1px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
  }
};

module.exports = WeeklyLayout;
