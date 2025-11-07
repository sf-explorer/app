# @sf-explorer/board-to-drawio

Transform SF Explorer board templates into draw.io (diagrams.net) XML format for easy visualization and editing in the popular diagramming tool.

## 📊 Quick Links

- **[📁 Generated Diagrams](./output/)** - All `.drawio` files ready to use
- **[🔗 Diagram Viewer Links](./docs/ALL_DIAGRAM_LINKS.md)** - Browse and open diagrams online
- **[📚 Documentation](./docs/)** - Full documentation and guides
- **[🚀 Quick Start](./docs/QUICK_START.md)** - Get started in 5 minutes

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
- 📊 **Dual Diagram Styles**: Choose between ERD (database) or UML (object-oriented) styles
- 🎯 **UML Class Diagrams**: Uses draw.io's dedicated `shape=umlClass` with visibility markers (+/-)
- 📦 **ERD Diagrams**: Traditional entity-relationship diagrams with collapsible swimlanes
- 🖼️ **Salesforce Icons**: Displays SLDS icons in table headers (standard, utility, custom, etc.)
- 🏷️ **Annotation Badges**: Display metadata badges (e.g., "20k" for record limits) above tables
- 🔗 **Smart Relationships**: Auto-converts to ER notation (ERone/ERmany) or UML (composition/association)
- 📦 **Group Zones**: Supports grouping and subject areas
- 🎯 **Customizable Output**: Multiple options to control what gets included
- 📝 **Multiple Node Types**: Supports tables, markdown, input nodes, and callouts
- 🔄 **Collapsible Tables**: Tables can be collapsed/expanded in draw.io for better diagram management (ERD style)
- 💬 **Tooltips**: Hover tooltips on tables and fields with descriptions and metadata

## Installation

```bash
npm install @sf-explorer/board-to-drawio
```

## Browser Support 🌐

This package works in **both Node.js and browsers**!

### Quick Start (Browser)

1. Build the package:
```bash
npm run build
```

2. Open `browser-example.html` in your browser for a minimal working example.

The package uses ES modules, so modern browsers can directly import `dist/index.js` without any bundling.

## Usage

### Basic Example (ERD Style)

```typescript
import { transformBoardToDrawIO } from '@sf-explorer/board-to-drawio';
import fs from 'fs';

// Load your board template
const board = JSON.parse(fs.readFileSync('myBoard.json', 'utf-8'));

// Transform to draw.io XML (default: ERD style)
const drawioXml = transformBoardToDrawIO(board);

// Save to file
fs.writeFileSync('output.drawio', drawioXml, 'utf-8');
```

### UML Class Diagram Style 🆕

Generate UML class diagrams using draw.io's dedicated UML shapes:

```typescript
// Transform to UML class diagram
const umlXml = transformBoardToDrawIO(board, {
  diagramStyle: 'uml',  // 👈 Use UML class diagram style
  title: 'My UML Class Diagram',
  showFieldTypes: true,
  umlOptions: {
    showVisibilityMarkers: true,   // + for public, - for private
    groupByVisibility: true,        // Group PK, regular fields, FK
    relationshipStyle: 'smart',     // Auto-detect composition/association
  },
});
```

**ERD vs UML Comparison:**

| Feature | ERD Style (default) | UML Style |
|---------|---------------------|-----------|
| **Shape** | Swimlane containers | `shape=umlClass` (dedicated UML) |
| **Fields** | Separate rows with PK/FK prefixes | Single text block with visibility markers |
| **Field Format** | `PK: Id : Text`<br>`FK: AccountId : Account` | `+ Id : Text`<br>`- AccountId : Account` |
| **Relationships** | ER notation (ERone ⊳, ERmany ⊲⊳) | UML notation (◆ composition, → association) |
| **Collapsible** | Yes (expand/collapse tables) | No (fixed height) |
| **Best For** | Database schemas, ERDs | Object-oriented models, class diagrams |

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
| `diagramStyle` | `'erd'` \| `'uml'` | `'erd'` | Diagram style: ERD (swimlane) or UML (class) |
| `includeReadOnlyFields` | boolean | `true` | Include read-only fields in tables |
| `includeGroupZones` | boolean | `true` | Convert group zones to containers |
| `title` | string | `'SF Explorer Board'` | Title for the diagram |
| `showFieldTypes` | boolean | `true` | Show data types next to field names |
| `showDescriptions` | boolean | `false` | Include field descriptions |
| `tableWidth` | number | `200` | Width of table boxes in pixels |
| `fieldHeight` | number | `26` | Height of each field row in pixels |
| `maxFields` | number | `20` | Maximum fields to show per table. Shows "... N more fields" for truncated tables |
| `collapseTables` | boolean | `true` | *(ERD only)* Collapse tables by default (click **+** to expand) |
| `umlOptions` | object | `{}` | *(UML only)* UML-specific configuration (see below) |

### UML Options

When `diagramStyle: 'uml'`, you can configure:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showVisibilityMarkers` | boolean | `true` | Show visibility: `+` (public), `-` (private) |
| `groupByVisibility` | boolean | `false` | Group fields: PK first, then regular, then FK |
| `relationshipStyle` | `'association'` \| `'smart'` | `'smart'` | Relationship arrows: simple (→) or smart (◆ for FK) |

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

### Annotation Badges 🏷️

Display metadata badges above tables to show important information like record counts or limits:

**In your board JSON:**
```json
{
  "id": "Case",
  "type": "table",
  "data": {
    "label": "Case",
    "annotation": "20k",  // 👈 Add this field
    "icon": "standard:case",
    "color": "#00A1E0"
  }
}
```

**Visual Result:**
- Creates a group wrapper containing the table and badge
- Badge appears at the top-right with orange styling
- Table is positioned below the badge
- The entire group moves together as one unit

**Common Use Cases:**
- `"20k"` - Salesforce record limits
- `"2M"` - Current record count
- `"Beta"` - Feature status
- `"Core"` - Categorization

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

