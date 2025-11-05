# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-04

### Changed
- **BREAKING**: Migrated from CommonJS to ES Modules (ESM)
  - Updated `tsconfig.json`: `"module": "ES2022"` and `"target": "ES2022"`
  - Added `"type": "module"` to `package.json`
  - Generated code now uses `export`/`import` instead of `module.exports`/`require()`
  - Consumers must use ES module syntax: `import { transformBoardToDrawIO } from '@sf-explorer/board-to-drawio'`
  - Module resolution changed to `"bundler"` for better compatibility with modern tools

### Removed
- **Dependency cleanup**: Removed `pako` and `@types/pako` dependencies
  - Viewer URLs now use direct URL encoding with `encodeURIComponent()`
  - No compression needed - URLs work perfectly without it
  - Zero runtime dependencies
- **Webpack build removed**: No longer need browser bundle
  - Removed `webpack` and `webpack-cli` from devDependencies
  - Removed `build:browser` npm script
  - Removed `browser/` output directory
  - Removed `src/browser.ts` entry point
  - Modern browsers can directly import `dist/index.js` as ES modules
  - Simplified `package.json` with modern `exports` field

### Migration Guide
If you were using CommonJS:
```javascript
// Old (CommonJS)
const { transformBoardToDrawIO } = require('@sf-explorer/board-to-drawio');

// New (ES Modules)
import { transformBoardToDrawIO } from '@sf-explorer/board-to-drawio';
```

## [1.1.0] - 2025-11-04

### Added
- **Table icons**: Salesforce Lightning Design System icons are now displayed in table headers
  - Automatically converts icon references (e.g., `standard:opportunity`, `utility:standard_objects`)
  - Uses public URLs to SLDS icons hosted on unpkg CDN
  - Icons embedded as HTML `<img>` tags in table labels (46×46 pixels)
  - Header height increased to 50px when icons are present for better visibility
  - Icons appear inline with table names using `vertical-align:middle`
  - Supports all SLDS icon categories: standard, utility, custom, action, doctype
- **`collapseTables` option**: Control whether tables are collapsed or expanded by default
  - Default: `true` (tables collapsed, showing only table name header)
  - Set to `false` to expand all tables by default
  - Users can still manually expand/collapse tables in draw.io viewer
  - Helps keep large diagrams manageable and focused
- **`generateViewerUrl(xml)`**: Generate shareable draw.io viewer links
  - Direct XML URL encoding (compatible with all browsers)
  - Format: `https://viewer.diagrams.net/?lightbox=1&...#R<url-encoded-xml>`
  - Perfect for sharing diagrams via email, Slack, Teams, etc.
  - Opens directly in browser without file download
- **`transformBoardWithViewerUrl(board, options)`**: Generate XML + viewer URL in one call
  - Returns `{ xml, viewerUrl }` object
  - Convenient for generating shareable links

### Changed
- **BREAKING**: Improved table structure to use proper swimlane containers with headers
  - Tables now have `swimlane=1` with `startSize=30` for proper header
  - Table names are displayed in the swimlane header (not as a child cell)
  - Better collapse/expand behavior in draw.io
- **Fixed table geometry for collapsed/expanded states**
  - When `collapseTables: true`, geometry shows header height (30px) and `alternateBounds` contains full height
  - When `collapseTables: false`, geometry shows full height and `alternateBounds` contains header height (30px)
  - Ensures correct visual display in draw.io viewer
  - Click +/− button to toggle between states with proper height transitions

### Added
- **`maxFields` option**: Limit the number of fields displayed per table (default: 20)
  - Tables with more fields show "... N more fields" indicator
  - Helps keep diagrams manageable for tables with many fields
- **Tooltips**: Hover tooltips for tables and fields using `<UserObject>` structure
  - Tables show field count: "24 fields" or "1091 fields (showing 20)"
  - Tables display schema description if available
  - Fields show their complete description on hover
  - Uses proper draw.io `<UserObject label="..." tooltip="...">` format
  - Newlines in tooltips converted to `&#xa;` for XML compatibility
  - Useful for quick reference without cluttering the diagram
- **Annotation/note support**: Annotation nodes are rendered as yellow sticky notes
  - Useful for adding comments and documentation to diagrams
  - Distinct visual style (#ffffcc background) for easy identification
- **Skip unsupported node types**: Input and legend nodes are now skipped
  - These nodes typically appear blank and clutter diagrams
  - Results in cleaner, more focused ERD diagrams

### Improved
- Table rendering now matches draw.io's standard container format
- Cleaner XML structure for better draw.io compatibility
- Enhanced documentation explaining collapse/expand feature
- Updated all example outputs with new container structure
- **Field format**: Changed from "name: type" to "name : type" (space before colon)
  - More readable format: "Id : Text" instead of "Id: Text"
- **Foreign key display**: FK fields now show referenced table name instead of "FK" type
  - Format: `FK: Product2Id : Product2` instead of `FK: Product2Id : FK`
  - Makes relationships clearer and more intuitive
  - Uses `x-target` property from schema when available
- **Fixed relationship arrow directions**: Corrected ERD arrows for `betweenTablesInverted` edges
  - Previously inverted edges showed incorrect cardinality (one-to-many instead of many-to-one)
  - Now correctly shows: Invoice (one) ← InvoiceLines (many)
  - Maintained existing behavior for `betweenTables` edges
- **Shadow enabled by default**: Diagrams now have shadows enabled (`shadow="1"`)
  - Adds depth and professional appearance to all elements

## [1.0.0] - 2025-11-03

### Added
- Initial release of board-to-drawio transformer
- Convert SF Explorer board templates to draw.io XML format
- Support for table nodes with full schema conversion
- Primary key and foreign key visual indicators (🔑 and 🔗 icons)
- Relationship mapping with ER diagram arrows
- Group zone support as containers
- Support for markdown, input, and callout nodes
- Color preservation from board templates
- Customizable conversion options:
  - `includeReadOnlyFields`: Control readonly field visibility
  - `includeGroupZones`: Include/exclude group zones
  - `showFieldTypes`: Toggle field type display
  - `showDescriptions`: Toggle description display
  - `tableWidth` and `fieldHeight`: Control table dimensions
- Comprehensive test suite
- Example scripts for batch conversion
- Full TypeScript type definitions
- MIT License

### Features
- ✅ Full draw.io XML generation
- ✅ Table and field rendering
- ✅ Relationship arrows with ER notation
- ✅ Color-coded tables based on board colors
- ✅ Foreign key and primary key styling
- ✅ Group/container support
- ✅ Position and layout preservation
- ✅ Compatible with draw.io desktop and web versions

[1.0.0]: https://github.com/sf-explorer/app/releases/tag/board-to-drawio-v1.0.0



