# UML Class Diagram Support

The board-to-drawio converter now supports generating **UML class diagrams** using draw.io's dedicated UML shapes!

## Quick Start

```typescript
import { transformBoardToDrawIO } from '@sf-explorer/board-to-drawio';

const umlXml = transformBoardToDrawIO(boardData, {
  diagramStyle: 'uml',  // 👈 Enable UML class diagram style
  umlOptions: {
    showVisibilityMarkers: true,
    groupByVisibility: true,
    relationshipStyle: 'smart',
  },
});
```

## Key Features

### 1. **Dedicated UML Shape** (`shape=umlClass`)
Uses draw.io's native UML class shape instead of custom swimlanes, ensuring proper rendering and standard UML appearance.

### 2. **Visibility Markers**
- `+` for public attributes (default for most fields)
- `-` for private attributes (readonly fields)

```
Account
-
+ Id : Text
+ Name : Text
- OwnerId : User
```

### 3. **Smart Relationship Mapping**

| Salesforce Relationship | UML Arrow | Description |
|-------------------------|-----------|-------------|
| Foreign Key (Lookup) | `◆→` | Composition (filled diamond) |
| Master-Detail | `◆→` | Composition (strong ownership) |
| Custom Edges | `→` | Association (simple arrow) |

### 4. **Field Grouping**
With `groupByVisibility: true`, fields are organized:
1. Primary Keys first
2. Regular attributes
3. Foreign Keys last

## ERD vs UML Comparison

### ERD Style (Default)
```
┌─────────────────────┐
│   Account           │ ← Header
├─────────────────────┤
│ PK: Id : Text       │ ← Separate row
│ FK: OwnerId : User  │ ← Separate row
│     Name : Text     │ ← Separate row
└─────────────────────┘
```
- ✅ Collapsible (expand/collapse)
- ✅ Individual field cells for connections
- ✅ Best for database schemas

### UML Style
```
┌─────────────────────┐
│      Account        │ ← Class name
├─────────────────────┤
│ + Id : Text         │ ← All in one text block
│ + Name : Text       │
│ - OwnerId : User    │
└─────────────────────┘
```
- ✅ Standard UML notation
- ✅ Clean, professional appearance
- ✅ Best for object-oriented models

## Configuration Options

```typescript
interface UmlOptions {
  showVisibilityMarkers?: boolean;  // Default: true
  groupByVisibility?: boolean;      // Default: false
  relationshipStyle?: 'association' | 'smart';  // Default: 'smart'
}
```

### `showVisibilityMarkers`
- `true`: Show `+` and `-` markers
- `false`: Plain field names without markers

### `groupByVisibility`
- `true`: Sort fields by type (PK → regular → FK)
- `false`: Keep original schema order

### `relationshipStyle`
- `'smart'`: Auto-detect composition (◆) for FK relationships
- `'association'`: Use simple arrows (→) for all relationships

## Example Output

See `output/productCatalog-uml.drawio` for a real example with:
- 11 UML class boxes
- 18 composition relationships
- Visibility markers on all attributes
- Professional UML styling

## Testing

```bash
# Run the UML test
npm run build
npx tsc test-uml.ts --module ES2022 --target ES2022 --moduleResolution bundler
node test-uml.js
```

This generates both ERD and UML versions of the Product Catalog board for comparison.

## When to Use Each Style

### Use ERD Style When:
- Working with database schemas
- Need to show detailed field metadata
- Want collapsible tables for large schemas
- Emphasizing database relationships (one-to-many, etc.)

### Use UML Style When:
- Modeling object-oriented systems
- Presenting to developers familiar with UML
- Need clean, standard class diagram notation
- Want to emphasize composition vs association
- Creating documentation for API objects

## Implementation Details

The UML class renderer:
1. Uses `shape=umlClass` for authentic UML appearance
2. Formats attributes as multi-line text: `ClassName\n-\n+ attr1\n+ attr2\n...`
3. Maps all field connections to the class cell (no separate field cells)
4. Uses `diamondThin` with `endFill=1` for composition arrows
5. Uses `open` arrow for simple associations

## Future Enhancements

Potential additions:
- Method/operation support (currently skipped per requirements)
- Interface shapes (`shape=umlInterface`)
- Abstract class support (italic names)
- Stereotypes (<<entity>>, <<service>>, etc.)
- Multiplicity on relationships (0..1, 1..*, etc.)

