
// ============================================================================
// UTILITIES MODULE
// ============================================================================
const Utils = {
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'],
    dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    
    getOrdinalSuffix(num) {
      const j = num % 10;
      const k = num % 100;
      if (j == 1 && k != 11) return num + "st";
      if (j == 2 && k != 12) return num + "nd";
      if (j == 3 && k != 13) return num + "rd";
      return num + "th";
    },
    
    formatDateKey(month, day) {
      return String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    },
    
    getDaysInMonth(year, month) {
      return new Date(year, month + 1, 0).getDate();
    }
  };

  module.exports = Utils;

  