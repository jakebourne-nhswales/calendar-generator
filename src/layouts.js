const Utils = require('./utils');
const Events = require('./events');


// ============================================================================
// LAYOUTS MODULE
// ============================================================================

const Layouts = {
    // Fortnight layout (2 columns, days 1-15 and 16-end)
    fortnight: {
      name: 'Fortnight',
      supportedSizes: ['A4-portrait'],
      
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
      
      getCSS(pageSize = 'A4-portrait') {
        return `
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
    },
    
    // Weekly grid layout with flexible sizing
    weekly: {
      name: 'Weekly',
      supportedSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait'],
      
      getWeeksInMonth(year, month) {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        const weeks = [];
        let currentWeek = [];
        
        // Add empty cells for days before month starts
        const startDayOfWeek = firstDay.getDay();
        for (let i = 0; i < startDayOfWeek; i++) {
          currentWeek.push(null);
        }
        
        // Add all days in month
        for (let day = 1; day <= daysInMonth; day++) {
          currentWeek.push(day);
          
          if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
          }
        }
        
        // Add remaining cells for last week
        if (currentWeek.length > 0) {
          while (currentWeek.length < 7) {
            currentWeek.push(null);
          }
          weeks.push(currentWeek);
        }
        
        return weeks;
      },
      
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
      
      generateLayout(month, year, options = {}) {
        const weeks = this.getWeeksInMonth(year, month);
        
        let html = '<div class="weekly-grid">';
        
        // Day headers
        html += '<div class="week-headers">';
        Utils.dayNames.forEach(dayName => {
          html += `<div class="week-header">${dayName}</div>`;
        });
        html += '</div>';
        
        // Weeks
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
      
      getCSS(pageSize = 'A4-portrait') {
        const sizeConfig = {
          'A4-portrait': {
            cellHeight: '80px',
            fontSize: '10px',
            dayNumSize: '18px',
            eventPadding: '4px'
          },
          'A4-landscape': {
            cellHeight: '100px',
            fontSize: '11px',
            dayNumSize: '20px',
            eventPadding: '6px'
          },
          'A5-portrait': {
            cellHeight: '60px',
            fontSize: '9px',
            dayNumSize: '16px',
            eventPadding: '3px'
          }
        };
        
        const config = sizeConfig[pageSize] || sizeConfig['A4-portrait'];
        
        return `
          .weekly-grid {
            display: flex;
            flex-direction: column;
            height: calc(100% - 100px);
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
            padding: 8px;
            text-align: center;
            font-weight: 700;
            font-size: 12px;
            color: white;
            text-transform: uppercase;
            letter-spacing: 0.5px;
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
            margin-bottom: 4px;
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
            line-height: 1.3;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `;
      }
    }
  };

  module.exports = Layouts;
