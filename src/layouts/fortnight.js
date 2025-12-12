// layouts/fortnight.js
// Two-column fortnight layout (days 1-15, days 16-end)

const Utils = require('../utils');
const Events = require('../events');

const FortnightLayout = {
  name: 'Fortnight',
  supportedSizes: ['A4-portrait', 'A5-portrait'],
  
  /**
   * Generate a single day card
   */
  generateDayCard(day, month, year, dayName, dateKey) {
    const currentDate = new Date(year, month, day);
    const dayOfWeek = currentDate.getDay();
    const today = new Date();
    
    let classes = 'day-card';
    if (dayOfWeek === 0 || dayOfWeek === 6) classes += ' weekend';
    if (today.getDate() === day && today.getMonth() === month && today.getFullYear() === year) {
      classes += ' today';
    }
    
    const eventHTML = Events.getEventHTML(dateKey, year);
    
    return `
      <div class="${classes}">
        <div class="day-info">
          <div class="day-name">${dayName}</div>
          <div class="day-number">${day}</div>
        </div>
        <div class="day-content">${eventHTML}</div>
      </div>
    `;
  },
  
  /**
   * Generate a column of days
   */
  generateColumn(startDay, endDay, month, year) {
    let html = '';
    for (let day = startDay; day <= endDay; day++) {
      const currentDate = new Date(year, month, day);
      const dayOfWeek = currentDate.getDay();
      const dayName = Utils.dayNames[dayOfWeek];
      const dateKey = Utils.formatDateKey(month, day);
      html += this.generateDayCard(day, month, year, dayName, dateKey);
    }
    return html;
  },
  
  /**
   * Generate the full layout
   */
  generateLayout(month, year, options = {}) {
    const daysInMonth = Utils.getDaysInMonth(year, month);
    
    return `
      <div class="fortnights">
        <div class="fortnight">
          <div class="days-grid">${this.generateColumn(1, 15, month, year)}</div>
        </div>
        <div class="fortnight">
          <div class="days-grid">${this.generateColumn(16, daysInMonth, month, year)}</div>
        </div>
      </div>
    `;
  },
  
  /**
   * Get CSS for this layout
   */
  getCSS(pageSize = 'A4-portrait') {
    return `
      .fortnights {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        height: 100%;
        min-height: 0;
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
      
      .day-card:hover {
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        transform: translateX(2px);
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
    `;
  }
};

module.exports = FortnightLayout;
