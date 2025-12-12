
const FortnightLayout = require('./layouts/fortnight');
const WeeklyLayout = require('./layouts/weekly');
const YearLayout = require('./layouts/year');


// ============================================================================
// LAYOUTS MODULE
// ============================================================================

// Layout mapping
const Layouts = {
    'fortnight': FortnightLayout,
    'weekly': WeeklyLayout,
    'year': YearLayout
  };
 
module.exports = Layouts;

