// ============================================================================
// THEMES MODULE
// ============================================================================
const Themes = {
    default: {
      name: 'Default',
      css: `
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
      `
    },
    
    ocean: {
      name: 'Ocean',
      css: `
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
      `
    },
    
    sunset: {
      name: 'Sunset',
      css: `
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
      `
    },
    
    minimalist: {
      name: 'Minimalist',
      css: `
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
      `
    },
    
    darkred: {
      name: 'Dark Red',
      css: `
        .theme-darkred {
          --primary-color: #8B0000;
          --secondary-color: #A52A2A;
          --accent-color: #DC143C;
          --background-color: #FFFFFF;
          --text-color: #2c3e50;
          --border-color: #8B0000;
          --header-bg: #4A0000;
          --header-text: #FFB6C1;
          --weekend-bg: #ecf0f1;
          --today-bg: #fff3cd;
        }
        
        .theme-darkred .day-info {
          background: #000000;
          padding: 8px;
          border-radius: 4px;
        }
        
        .theme-darkred .day-name {
          color:rgba(230, 13, 45, 0.82);
        }
        
        .theme-darkred .day-number {
          color:rgba(60, 98, 247, 0.96);
        }
        
        .theme-darkred .day-card.weekend .day-name {
          color: #FFB6C1;
        }
        
        .theme-darkred .day-card.weekend .day-number {
          color: #FFB6C1;
        }
      `
    },
    
    getAllThemesCSS() {
      return Object.values(this)
        .filter(theme => theme.css)
        .map(theme => theme.css)
        .join('\n');
    }
  };


  module.exports = Themes;
