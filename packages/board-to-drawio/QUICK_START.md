# Quick Start Guide: board-to-drawio

## What is this?

Transform your SF Explorer board templates into beautiful, editable draw.io diagrams in seconds!

## Installation

```bash
cd packages/board-to-drawio
npm install
npm run build
```

## Usage Options

### Option 1: Single Board Conversion (Test Script)

```bash
npm test
```

This converts the Product Catalog board in three variants:
- **Full**: All fields including readonly
- **Clean**: No readonly fields
- **Simple**: Minimal information

### Option 2: Convert All Boards (Batch Script)

```bash
node batch-convert.js
```

This converts all 17 board templates to draw.io format!

### Option 3: Programmatic Usage

```javascript
const { transformBoardToDrawIO } = require('./dist/index');
const board = require('../../Boards/salescloud.json');

const xml = transformBoardToDrawIO(board, {
  showFieldTypes: true,
  includeGroupZones: true
});

require('fs').writeFileSync('output.drawio', xml);
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeReadOnlyFields` | boolean | `true` | Include readonly fields (Id, timestamps, etc.) |
| `includeGroupZones` | boolean | `true` | Convert group zones to containers |
| `showFieldTypes` | boolean | `true` | Show data types next to field names |
| `showDescriptions` | boolean | `false` | Include field descriptions |
| `title` | string | `'SF Explorer Board'` | Diagram title |
| `tableWidth` | number | `200` | Width of table boxes (pixels) |
| `fieldHeight` | number | `26` | Height of each field row (pixels) |
| `maxFields` | number | `20` | Max fields per table (shows "... N more" if exceeded) |
| `collapseTables` | boolean | `true` | Collapse tables by default (click **+** to expand) |

## Opening the Generated Files

### Desktop App (Recommended)
1. Download from [diagrams.net](https://www.diagrams.net/)
2. Open any `.drawio` file from the `output/` folder

### Web Browser
1. Go to [app.diagrams.net](https://app.diagrams.net/)
2. Click "Open Existing Diagram"
3. Select your `.drawio` file

### VS Code
1. Install [Draw.io Integration](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
2. Open any `.drawio` file

## What Gets Converted?

### ✅ Tables
- All fields with types
- Primary keys (PK: prefix, bold)
- Foreign keys (FK: prefix, showing referenced table name)
- Color-coded by category
- **Salesforce Icons**: Tables display SLDS icons in their headers
  - Automatically loaded from Salesforce Lightning Design System
  - Supports all icon types: standard, utility, custom, action, doctype
  - Icons appear on the left side of table names
- **Tooltips on hover**:
  - Tables show field count and description
  - Fields show their full description
- **Collapsible swimlane format**:
  - Each table has a header with the table name
  - **Tables are collapsed by default** (only showing the table name)
  - Click the **+** button to expand (show all fields)
  - Click the **−** button to collapse (hide all fields)
  - Great for simplifying complex diagrams with many tables!
  - Set `collapseTables: false` to expand all tables by default

### ✅ Relationships
- One-to-many arrows
- Many-to-one arrows
- ER notation (crow's foot)
- Orthogonal routing

### ✅ Other Elements
- Group zones → Containers
- Markdown → Text boxes
- Callouts → Note shapes with API details
- Annotations → Yellow sticky notes
- Input/legend nodes → Skipped (cleaner diagrams)

## Generated Files

After running `npm test`:
```
output/
├── productCatalog-full.drawio     (91 KB)
├── productCatalog-clean.drawio    (70 KB)
└── productCatalog-simple.drawio   (69 KB)
```

After running `node batch-convert.js`:
```
output/
├── actionPlan.drawio          (26 KB)
├── agentForce.drawio          (35 KB)
├── agentInteractions.drawio   (14 KB)
├── billingAccounting.drawio   (214 KB)
├── ... (13 more boards)
└── shield.drawio              (35 KB)
```

## Examples

### Convert with All Fields
```javascript
transformBoardToDrawIO(board, {
  includeReadOnlyFields: true,
  showFieldTypes: true,
  showDescriptions: true
})
```

### Convert Clean (No Readonly)
```javascript
transformBoardToDrawIO(board, {
  includeReadOnlyFields: false,
  showFieldTypes: true,
  showDescriptions: false
})
```

### Minimal Conversion
```javascript
transformBoardToDrawIO(board, {
  includeReadOnlyFields: false,
  showFieldTypes: false,
  showDescriptions: false,
  includeGroupZones: false
})
```

### Large Tables
```javascript
transformBoardToDrawIO(board, {
  tableWidth: 280,
  fieldHeight: 30
})
```

## Troubleshooting

### "Invalid board template" error
Make sure your JSON has `nodes` and `edges` arrays:
```json
{
  "nodes": [...],
  "edges": [...]
}
```

### Tables look too small/large
Adjust `tableWidth` and `fieldHeight` options:
```javascript
transformBoardToDrawIO(board, {
  tableWidth: 250,    // wider tables
  fieldHeight: 30     // taller rows
})
```

### Missing relationships
Make sure edges have proper `source` and `target` that match node IDs.

### Colors don't match
The transformer converts RGBA to hex and applies slight adjustments. Original colors are preserved as closely as possible.

## Next Steps

1. ✅ Run `npm test` to see sample output
2. ✅ Run `node batch-convert.js` to convert all boards
3. ✅ Open a `.drawio` file and explore
4. ✅ Edit the diagram in draw.io
5. ✅ Export to PDF/PNG/SVG for presentations

## Tips

- **For Documentation**: Use `includeReadOnlyFields: true` to show complete schema
- **For ERD Diagrams**: Use `includeReadOnlyFields: false` for cleaner relationship view
- **For Presentations**: Enable `showDescriptions: true` for context
- **For Quick Reference**: Use smaller `tableWidth` and `fieldHeight` for compact diagrams

## Learn More

- [Full README](./README.md)
- [Project Summary](./PROJECT_SUMMARY.md)
- [Changelog](./CHANGELOG.md)
- [draw.io Documentation](https://www.diagrams.net/doc/)



