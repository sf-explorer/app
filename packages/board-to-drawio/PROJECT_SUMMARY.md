# Board-to-DrawIO Project Summary

## Overview

The `board-to-drawio` package transforms SF Explorer board templates into draw.io (diagrams.net) XML format, enabling users to visualize and edit their Salesforce data models in the popular diagramming tool.

## Key Features

### 1. Full Visual Conversion
- Preserves colors, positions, and dimensions from board templates
- Converts tables with complete schema information
- Maintains relationships between entities
- Supports multiple node types (tables, groups, markdown, callouts)

### 2. ER Diagram Support
- Primary keys marked with 🔑 icon (bold + underline)
- Foreign keys marked with 🔗 icon (italic)
- Automatic relationship arrows with ER notation
- Orthogonal routing for clean diagram layout

### 3. Flexible Configuration
```typescript
transformBoardToDrawIO(board, {
  includeReadOnlyFields: false,    // Skip system fields
  includeGroupZones: true,          // Include containers
  showFieldTypes: true,             // Display data types
  showDescriptions: false,          // Hide descriptions
  tableWidth: 200,                  // Table box width
  fieldHeight: 26,                  // Field row height
});
```

### 4. Node Type Support

| Board Node Type | Draw.io Representation |
|----------------|------------------------|
| `table` | Swimlane with stacked fields |
| `groupZone` | Container/subject area |
| `markdown` | Centered text box |
| `callout` | Note shape with API details |
| `annotation`, `note` | Yellow sticky note |
| `input`, `legend` | Skipped (no visual content) |

### 5. Color Handling
- Automatic conversion from RGBA to hex
- Color lightening for field backgrounds
- Color darkening for borders
- Consistent color scheme preservation

## Architecture

### Type System
- `BoardTemplate`: Input format (nodes + edges)
- `DrawioCell`: Output format (mxGraph cells)
- `ConversionOptions`: Configuration interface
- Full TypeScript type safety

### Transformation Pipeline
1. **Parse Input**: Load board template JSON
2. **Process Nodes**: Convert each node type to draw.io cells
   - Group zones → Containers (first pass)
   - Tables → Swimlanes with fields (second pass)
   - Other nodes → Appropriate shapes (third pass)
3. **Process Edges**: Convert relationships to connections
4. **Generate XML**: Build mxGraph XML structure

### XML Structure
```xml
<mxfile>
  <diagram>
    <mxGraphModel>
      <root>
        <mxCell id="0"/> <!-- Root -->
        <mxCell id="1" parent="0"/> <!-- Default parent -->
        <!-- Table cells with geometry -->
        <!-- Field cells as children -->
        <!-- Edge cells with source/target -->
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
```

## Implementation Highlights

### Table Rendering
- **Container Structure**: Tables use proper swimlane containers with headers
- **Parent Cell**: Table container with `swimlane=1` and table name in header
- **Child Cells**: Individual fields stacked inside the container
- **Auto-calculated Height**: Based on header (30px) + field count × field height
- **Collapse/Expand Support**: 
  - Each table has a collapse/expand button (−/+) in the header
  - When collapsed, only the table name header is visible
  - When expanded, all fields are shown
  - `alternateBounds` defines the collapsed size (200px × 30px)
  - Users can click the button in draw.io to toggle state

### Relationship Arrows
- `betweenTables` → Many-to-one (ERmany to ERone)
- `betweenTablesInverted` → One-to-many (ERone to ERmany)
- Orthogonal routing with automatic jetty sizing
- No fill on arrow endpoints (hollow arrows)

### Color Functions
```typescript
rgbaToHex()      // rgba(r,g,b,a) → #rrggbb
darkenColor()    // Reduce brightness by %
lightenColor()   // Increase brightness by %
```

### Style Building
```typescript
buildStyle({
  swimlane: 0,
  fillColor: '#3b82f6',
  strokeColor: '#1e40af',
  fontSize: 13,
  // ... more properties
})
// Returns: "swimlane=0;fillColor=#3b82f6;strokeColor=#1e40af;fontSize=13;"
```

## Testing

### Test Coverage
1. **Full Conversion**: All fields, types, descriptions
2. **Clean Conversion**: No readonly fields
3. **Simple Conversion**: Minimal information

### Test Results
```
✓ Product Catalog Board
  - 16 nodes, 18 edges
  - Full: 91.54 KB
  - Clean: 70.03 KB
  - Simple: 68.65 KB
```

## Output Compatibility

The generated XML works with:
- **draw.io Desktop** (Windows/Mac/Linux)
- **app.diagrams.net** (Web browser)
- **VS Code Draw.io Extension**
- **Confluence** (draw.io plugin)
- **Notion** (via import)

## Use Cases

### 1. Documentation
Export board templates to draw.io for:
- Technical documentation
- Architecture diagrams
- Training materials
- Presentation slides

### 2. Collaboration
- Share diagrams with non-technical stakeholders
- Enable editing without SF Explorer access
- Export to PDF/PNG/SVG for reports
- Embed in wikis and documentation sites

### 3. Design Review
- Visual review of data models
- ERD validation
- Relationship verification
- Schema planning

### 4. Integration
- Batch conversion of multiple boards
- CI/CD pipeline integration
- Automated documentation generation
- Version control of diagrams

## Performance

### Conversion Speed
- ~1-2ms per node
- ~0.5ms per edge
- Minimal memory footprint
- Synchronous processing

### Output Size
- Typical table: ~3-5 KB
- Full diagram: 50-150 KB
- Compressed (gzip): 10-30 KB

## Future Enhancements

Potential additions:
- [ ] Custom color themes
- [ ] Mermaid.js output format
- [ ] PlantUML output format
- [ ] SVG direct export
- [ ] Interactive HTML output
- [ ] Style templates
- [ ] Multi-page diagrams
- [ ] Layer support
- [ ] Annotation support

## Related Packages

- `@sf-explorer/board-to-drawdb`: DrawDB converter
- Future: `board-to-mermaid`, `board-to-plantuml`

## Resources

- [Draw.io File Format](https://www.diagrams.net/doc/faq/format-xml)
- [mxGraph Documentation](https://jgraph.github.io/mxgraph/)
- [Draw.io Shapes](https://www.diagrams.net/doc/faq/shape-complex-create-edit)



