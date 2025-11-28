# Calendar Generator - Command-Line Usage

## USAGE:
  node calendar-generator.js [month] [year] [theme] [layout] [pageSize] [options]

## ARGUMENTS:
  month       Month number (1-12), default: current month
  year        Year (e.g., 2025), default: current year
  theme       Theme name: default, ocean, sunset, minimalist, darkred
  layout      Layout name: fortnight, weekly
  pageSize    Page size: A4-portrait, A4-landscape, A5-portrait, A5-landscape

## OPTIONS:
  --events=FILE          Load events from JSON file
  --image=PATH           Add image on facing page
  --output=FILE          Custom output file path

## EXAMPLES:
  ### Basic usage - current month, default theme and layout
  node calendar-generator.js

  ### Specific month and year with theme
  node calendar-generator.js 12 2025 darkred

  ### Weekly grid layout with A4 landscape
  node calendar-generator.js 12 2025 ocean weekly A4-landscape

  ### With custom events file
  node calendar-generator.js 12 2025 darkred weekly A4-portrait --events=events.json

  ### With image on facing page
  node calendar-generator.js 12 2025 ocean fortnight A4-portrait --image=photo.jpg

  ### A5 portrait for small planners
  node calendar-generator.js 3 2025 minimalist weekly A5-portrait

## SUPPORTED SIZES:
  - A4-portrait (210mm x 297mm)
  - A4-landscape (297mm x 210mm)
  - A5-portrait (148mm x 210mm)
  - A5-landscape (210mm x 148mm)

## LAYOUTS:
  - fortnight: Two-column layout (days 1-15, days 16-end)
  - weekly: Traditional calendar grid with weeks

## THEMES:
  - default: Professional blue/gray
  - ocean: Cool blues and teals
  - sunset: Warm oranges and yellows
  - minimalist: Clean black and white
  - darkred: Dramatic dark red with pink accents
