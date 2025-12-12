// utils.js
// Utility functions for calendar generation

const Utils = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  
  dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  
  /**
   * Get ordinal suffix for numbers (1st, 2nd, 3rd, etc.)
   */
  getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return num + "st";
    if (j == 2 && k != 12) return num + "nd";
    if (j == 3 && k != 13) return num + "rd";
    return num + "th";
  },
  
  /**
   * Format date as MM-DD string
   */
  formatDateKey(month, day) {
    return String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
  },
  
  /**
   * Get number of days in a month
   */
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },
  
  /**
   * Get weeks in a month as array of arrays
   */
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
  }
};

module.exports = Utils;