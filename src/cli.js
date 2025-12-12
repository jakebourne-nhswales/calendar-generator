
const Utils = require('./utils');
const Layouts = require('./layouts');
const { generatePDF } = require('./calendar-generator');


/**
 * Display help information
 */
function showHelp() {
    console.log(`
  Calendar Generator - Command Line Interface
  
  USAGE:
    node cli.js [month] [year] [theme] [layout] [pageSize] [options]
  
  ARGUMENTS:
    month       Month number (1-12), default: current month
    year        Year (e.g., 2025), default: current year
    theme       Theme: default, ocean, sunset, minimalist, darkred
    layout      Layout: fortnight, weekly, year
    pageSize    Page size: A4-portrait, A4-landscape, A5-portrait, A5-landscape
  
  OPTIONS:
    --events=FILE          Load events from JSON file
    --image=PATH           Add image on facing page
    --logo=PATH            Add brand logo (PNG, JPG, SVG)
    --logo-pos=POSITION    Logo position: header, footer, auto (default: auto)
    --logo-align=ALIGN     Logo alignment: left, center, right (default: right)
    --output=FILE          Custom output file path
    --help, -h             Show this help message
  
  EXAMPLES:
    # Current month with defaults
    node cli.js
  
    # Specific month and theme
    node cli.js 12 2025 ocean
  
    # Weekly layout with landscape orientation
    node cli.js 12 2025 ocean weekly A4-landscape
  
    # With events file
    node cli.js 12 2025 darkred weekly A4-portrait --events=holidays.json
  
    # With logo in header (left-aligned)
    node cli.js 12 2025 ocean fortnight A4-portrait --logo=logo.png --logo-align=left
  
    # Year overview with footer logo
    node cli.js 1 2025 sunset year A4-portrait --logo=brand.png --logo-pos=footer
  
    # Complete example with all options
    node cli.js 12 2025 ocean fortnight A4-portrait \\
      --events=holidays.json \\
      --image=photo.jpg \\
      --logo=company.png \\
      --logo-align=center \\
      --output=december-2025.pdf
  
  THEMES:
    - default     Professional blue/gray
    - ocean       Cool blues and teals
    - sunset      Warm oranges and yellows
    - minimalist  Clean black and white
    - darkred     Dramatic dark red with pink accents
  
  LAYOUTS:
    - fortnight   Two-column layout (days 1-15, days 16-end)
    - weekly      Traditional calendar grid with weeks
    - year        12 mini monthly grids (3×4 portrait, 4×3 landscape)
  
  PAGE SIZES:
    - A4-portrait     210mm × 297mm
    - A4-landscape    297mm × 210mm
    - A5-portrait     148mm × 210mm
    - A5-landscape    210mm × 148mm
    `);
  }
  
  /**
   * Parse command line arguments
   */
  function parseArgs(args) {
    // Check for help flag
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      process.exit(0);
    }
    
    // Parse positional arguments
    const month = args[0] && !args[0].startsWith('--') ? 
      parseInt(args[0]) - 1 : new Date().getMonth();
    const year = args[1] && !args[1].startsWith('--') ? 
      parseInt(args[1]) : new Date().getFullYear();
    const theme = args[2] && !args[2].startsWith('--') ? 
      args[2] : 'default';
    const layout = args[3] && !args[3].startsWith('--') ? 
      args[3] : 'fortnight';
    const pageSize = args[4] && !args[4].startsWith('--') ? 
      args[4] : 'A4-portrait';
    
    // Parse options
    const options = {
      theme,
      layout: Layouts[layout] || FortnightLayout,
      pageSize,
      eventsFile: null,
      imagePath: null,
      withImage: false,
      logoPath: null,
      logoPosition: 'auto',
      logoAlign: 'right',
      outputPath: null
    };
    
    args.forEach(arg => {
      if (arg.startsWith('--events=')) {
        options.eventsFile = arg.split('=')[1];
      } else if (arg.startsWith('--image=')) {
        options.imagePath = arg.split('=')[1];
        options.withImage = true;
      } else if (arg.startsWith('--logo=')) {
        options.logoPath = arg.split('=')[1];
      } else if (arg.startsWith('--logo-pos=')) {
        options.logoPosition = arg.split('=')[1];
      } else if (arg.startsWith('--logo-align=')) {
        options.logoAlign = arg.split('=')[1];
      } else if (arg.startsWith('--output=')) {
        options.outputPath = arg.split('=')[1];
      }
    });
    
    return { month, year, options };
  }
  
  /**
   * Main CLI execution
   */
  async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }
    
    try {
      const { month, year, options } = parseArgs(args);
      
      console.log(`
  Generating calendar:
    Month: ${Utils.monthNames[month]} ${year}
    Theme: ${options.theme}
    Layout: ${options.layout.name}
    Page Size: ${options.pageSize}
    ${options.eventsFile ? 'Events: ' + options.eventsFile : ''}
    ${options.imagePath ? 'Image: ' + options.imagePath : ''}
    ${options.logoPath ? 'Logo: ' + options.logoPath + ' (' + options.logoPosition + ', ' + options.logoAlign + ')' : ''}
      `);
      
      const { htmlPath, pdfPath } = await generatePDF(month, year, options);
      
      console.log('\n✓ Calendar generation complete!');
      console.log(`  HTML: ${htmlPath}`);
      console.log(`  PDF: ${pdfPath}`);
      
    } catch (error) {
      console.error('✗ Error generating calendar:', error.message);
      process.exit(1);
    }
  }
  
  // Run if called directly
  if (require.main === module) {
    main();
  }
  
  module.exports = { parseArgs, showHelp };