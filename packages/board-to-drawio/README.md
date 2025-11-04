# @sf-explorer/board-to-drawio

Transform SF Explorer board templates into draw.io (diagrams.net) XML format for easy visualization and editing in the popular diagramming tool.

## Usage

### Generate Viewer URLs

Create shareable links to open diagrams directly in draw.io viewer:

```typescript
import { transformBoardWithViewerUrl } from '@sf-explorer/board-to-drawio';

const { xml, viewerUrl } = transformBoardWithViewerUrl(boardData);
console.log(viewerUrl);
// → https://viewer.diagrams.net/?lightbox=1&...#R<compressed>
```

Or generate URLs separately:

```typescript
import { transformBoardToDrawIO, generateViewerUrl } from '@sf-explorer/board-to-drawio';

const xml = transformBoardToDrawIO(boardData);
const viewerUrl = generateViewerUrl(xml);
```

**Benefits:**
- 📧 Email diagrams as clickable links
- 🔗 Share via Slack, Teams, etc.
- 📱 Open directly in browser (no file download)
- 🎯 Direct XML encoding (compatible with all browsers)

## Features

- 🎨 **Full Visual Fidelity**: Preserves colors, positions, and relationships from your board templates
- 📊 **Table Support**: Converts Salesforce schema tables with fields, types, and relationships
- 🖼️ **Salesforce Icons**: Displays SLDS icons in table headers (standard, utility, custom, etc.)
- 🔗 **Relationship Mapping**: Automatically converts edges to proper ER diagram relationships with correct cardinality
- 📦 **Group Zones**: Supports grouping and subject areas
- 🎯 **Customizable Output**: Multiple options to control what gets included
- 📝 **Multiple Node Types**: Supports tables, markdown, input nodes, and callouts
- 🔄 **Collapsible Tables**: Tables can be collapsed/expanded in draw.io for better diagram management
- 💬 **Tooltips**: Hover tooltips on tables and fields with descriptions and metadata

## Installation

```bash
npm install @sf-explorer/board-to-drawio
```

## Browser Support 🌐

This package works in **both Node.js and browsers**!

### Quick Start (Browser)

1. Build the browser bundle:
```bash
npm run build:browser
```

2. Open `demo.html` in your browser for a full-featured UI, or use `browser-example.html` for a minimal example.

See [BROWSER_SUPPORT.md](./BROWSER_SUPPORT.md) for complete browser usage guide.

## Usage

### Basic Example

```typescript
import { transformBoardToDrawIO } from '@sf-explorer/board-to-drawio';
import fs from 'fs';

// Load your board template
const board = JSON.parse(fs.readFileSync('myBoard.json', 'utf-8'));

// Transform to draw.io XML
const drawioXml = transformBoardToDrawIO(board);

// Save to file
fs.writeFileSync('output.drawio', drawioXml, 'utf-8');
```

### With Options

```typescript
const drawioXml = transformBoardToDrawIO(board, {
  includeReadOnlyFields: false,    // Skip readonly fields
  includeGroupZones: true,          // Include group zones as containers
  title: 'My ERD Diagram',          // Diagram title
  showFieldTypes: true,             // Show field types (Text, Number, etc.)
  showDescriptions: false,          // Hide field descriptions
  tableWidth: 200,                  // Width of table boxes
  fieldHeight: 26,                  // Height of each field row
  maxFields: 20,                    // Maximum fields per table (default: 20)
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `includeReadOnlyFields` | boolean | `true` | Include read-only fields in tables |
| `includeGroupZones` | boolean | `true` | Convert group zones to containers |
| `title` | string | `'SF Explorer Board'` | Title for the diagram |
| `showFieldTypes` | boolean | `true` | Show data types next to field names |
| `showDescriptions` | boolean | `false` | Include field descriptions |
| `tableWidth` | number | `200` | Width of table boxes in pixels |
| `fieldHeight` | number | `26` | Height of each field row in pixels |
| `maxFields` | number | `20` | Maximum fields to show per table. Shows "... N more fields" for truncated tables |
| `collapseTables` | boolean | `true` | Collapse tables by default (click **+** to expand) |

## Output Format

The transformer generates standard draw.io XML that can be opened with:

- **draw.io Desktop App**: Download from [diagrams.net](https://www.diagrams.net/)
- **Online Editor**: Open directly at [app.diagrams.net](https://app.diagrams.net/)
- **VS Code**: Use the [Draw.io Integration extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)

## Visual Features

### Tables
- **Collapsible containers**: Each table can be collapsed/expanded via the −/+ button
- **Tooltips**: Hover to see field count and table description
  - Shows total fields: "24 fields" or "1091 fields (showing 20)" if truncated
  - Displays schema description if available
- Primary keys shown with PK: prefix and bold styling
- Foreign keys shown with FK: prefix
- Color-coded based on your board's color scheme
- Automatic relationship arrows between tables
- Swimlane format with proper header structure

### Group Zones
- Rendered as swim lane containers
- Preserves position and size
- Tables inside groups are properly nested

### Other Nodes
- Markdown nodes → Text boxes with larger fonts
- Callout nodes → Note shapes with method/URL information
- Annotation/note nodes → Yellow note shapes (sticky notes)
- Input/legend nodes → Skipped (no useful visual representation)

### Relationships
- Automatic ER notation (crow's foot)
- One-to-many and many-to-one relationships
- Orthogonal routing for clean diagrams

## Example Output

Given a board with Product and Order tables:

```json
{
  "nodes": [
    {
      "id": "Product",
      "type": "table",
      "position": { "x": 100, "y": 100 },
      "data": {
        "label": "Product",
        "schema": {
          "properties": {
            "Id": { "type": "string", "title": "Product ID" },
            "Name": { "type": "string", "title": "Product Name" }
          }
        }
      }
    }
  ],
  "edges": []
}
```

The output will be a properly formatted draw.io XML with:
- A table box titled "Product"
- Fields: Id (primary key) and Name
- Proper styling and colors

## Testing

Run the included test script:

```bash
npm run build
npm test
```

This will generate sample outputs in the `output/` directory.

## Development

```bash
# Build the package
npm run build

# Watch for changes
npm run watch
```

## Related Packages

- [@sf-explorer/board-to-drawdb](../board-to-drawdb): Transform boards to DrawDB format

## License

MIT

## Contributing

Issues and pull requests are welcome on the [GitHub repository](https://github.com/sf-explorer/app).

