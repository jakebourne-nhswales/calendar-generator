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
    supportedSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'],
    
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
    },


  // Year overview layout with 12 monthly grids
  year: {
    name: 'Year',
    supportedSizes: ['A4-portrait', 'A4-landscape', 'A5-portrait', 'A5-landscape'],
    
    getWeeksInMonth(year, month) {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      const weeks = [];
      let currentWeek = [];
      
      const startDayOfWeek = firstDay.getDay();
      for (let i = 0; i < startDayOfWeek; i++) {
        currentWeek.push(null);
      }
      
      for (let day = 1; day <= daysInMonth; day++) {
        currentWeek.push(day);
        
        if (currentWeek.length === 7) {
          weeks.push(currentWeek);
          currentWeek = [];
        }
      }
      
      if (currentWeek.length > 0) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        weeks.push(currentWeek);
      }
      
      return weeks;
    },
    
    generateMiniMonth(month, year) {
      const weeks = this.getWeeksInMonth(year, month);
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
    
    generateLayout(month, year, options = {}) {
      const pageSize = options.pageSize || 'A4-portrait';
      const isPortrait = pageSize.includes('portrait');
      
      let html = '<div class="year-grid">';
      
      // Generate all 12 months
      for (let m = 0; m < 12; m++) {
        html += this.generateMiniMonth(m, year);
      }
      
      html += '</div>';
      return html;
    },
    
    getCSS(pageSize = 'A4-portrait') {
      const isPortrait = pageSize.includes('portrait');
      const isA5 = pageSize.includes('A5');
      
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
          height: calc(100% - 100px);
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
  }
};
  
module.exports = Layouts;
