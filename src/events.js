const fs = require('fs');

const Utils = require('./utils');

// ============================================================================
// EVENTS MODULE
// ============================================================================
const Events = {
    // Event storage
    events: {
      '11-05': {
        type: 'birthday',
        lines: ["Sarah's Birthday", "Cake at noon", ""],
        originalYear: 2004
      },
      '11-14': {
        type: 'anniversary',
        lines: ["Wedding Anniversary", "Dinner reservation 7pm", ""],
        originalYear: 2015
      },
      '12-25': {
        type: 'public',
        lines: ["Christmas Day", "Family gathering", ""],
        originalYear: null
      }
    },
    
    processEventText(event, currentYear) {
      if (!event.originalYear || (event.type !== 'birthday' && event.type !== 'anniversary')) {
        return event.lines;
      }
  
      const yearsPassed = currentYear - event.originalYear;
      const processedLines = [...event.lines];
      
      if (yearsPassed >= 0 && processedLines[0]) {
        if (event.type === 'birthday') {
          const age = yearsPassed;
          if (processedLines[0].toLowerCase().includes('birthday')) {
            processedLines[0] = processedLines[0].replace(/birthday/gi, Utils.getOrdinalSuffix(age) + ' Birthday');
          } else {
            processedLines[0] = processedLines[0] + ' (' + Utils.getOrdinalSuffix(age) + ')';
          }
        } else if (event.type === 'anniversary') {
          const years = yearsPassed;
          if (processedLines[0].toLowerCase().includes('anniversary')) {
            processedLines[0] = processedLines[0].replace(/anniversary/gi, Utils.getOrdinalSuffix(years) + ' Anniversary');
          } else {
            processedLines[0] = processedLines[0] + ' (' + Utils.getOrdinalSuffix(years) + ')';
          }
        }
      }
      
      return processedLines;
    },
    
    getEventHTML(dateKey, year) {
      if (!this.events[dateKey]) return '';
      
      const processedLines = this.processEventText(this.events[dateKey], year);
      const eventLines = processedLines
        .filter(line => line.trim())
        .map(line => `<div class="event-line ${this.events[dateKey].type}">${line}</div>`)
        .join('');
      return `<div class="events-card">${eventLines}</div>`;
    },
    
    addEvent(dateKey, eventData) {
      this.events[dateKey] = eventData;
    },
    
    clearEvents() {
      this.events = {};
    },
    
    loadEventsFromFile(filePath) {
      try {
        const data = fs.readFileSync(filePath, 'utf8');
        this.events = JSON.parse(data);
        console.log(`Loaded events from ${filePath}`);
      } catch (err) {
        console.error(`Error loading events: ${err.message}`);
      }
    }
  };

  module.exports = Events;
