# @sf-explorer/board-to-drawdb

Transform SF Explorer board templates into drawDB compatible format.

## Overview

This package provides a TypeScript function to convert Salesforce Explorer Entity Relationship Diagram (ERD) board templates into a format compatible with [drawDB](https://drawdb.vercel.app/), a popular database diagram tool.

## Installation

```bash
npm install @sf-explorer/board-to-drawdb
```

## Usage

### Basic Usage

```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import boardTemplate from './Boards/salescloud.json';

// Convert the board template to drawDB format
const drawDBSchema = transformBoardToDrawDB(boardTemplate);

// Use the schema with drawDB or export as JSON
console.log(JSON.stringify(drawDBSchema, null, 2));
```

### With Options

```typescript
import { transformBoardToDrawDB, ConversionOptions } from '@sf-explorer/board-to-drawdb';

const options: ConversionOptions = {
  includeReadOnlyFields: false,  // Exclude read-only fields like Id, CreatedDate
  includeGroupZones: true,        // Include group zones as subject areas
  defaultDatabase: 'postgresql'   // Target database type
};

const drawDBSchema = transformBoardToDrawDB(boardTemplate, options);
```

## API Reference

### `transformBoardToDrawDB(board, options?)`

Transforms a board template into a drawDB schema.

#### Parameters

- `board: BoardTemplate` - The SF Explorer board template to convert
- `options?: ConversionOptions` - Optional conversion settings
  - `includeReadOnlyFields?: boolean` - Include read-only fields (default: `true`)
  - `includeGroupZones?: boolean` - Convert group zones to subject areas (default: `true`)
  - `defaultDatabase?: string` - Target database type (default: `'generic'`)
    - Supported values: `'generic'`, `'postgresql'`, `'mysql'`, `'sqlite'`, `'mssql'`

#### Returns

`DrawDBSchema` - A drawDB-compatible schema object containing:
- `tables` - Array of table definitions with columns
- `relationships` - Array of relationships between tables
- `notes` - Array of notes (converted from descriptions)
- `subjectAreas` - Array of subject areas (converted from group zones)
- `database` - Target database type

## Type Definitions

### BoardTemplate

```typescript
interface BoardTemplate {
  nodes: BoardNode[];
  edges: BoardEdge[];
}
```

### DrawDBSchema

```typescript
interface DrawDBSchema {
  tables: DrawDBTable[];
  relationships: DrawDBRelationship[];
  notes?: DrawDBNote[];
  subjectAreas?: DrawDBArea[];
  database?: 'generic' | 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
}
```

## Features

- **Table Conversion**: Converts board table nodes to drawDB table definitions
- **Field Mapping**: Maps Salesforce field types to SQL data types
- **Relationship Detection**: Automatically detects and converts lookup/master-detail relationships
- **Group Zone Support**: Optionally converts group zones into subject areas
- **Cardinality Detection**: Intelligently determines relationship cardinality
- **Positioning**: Preserves node positions for consistent diagram layout

## Type Mapping

The transformer automatically maps Salesforce/JSON Schema types to SQL types:

| JSON Schema Type | Format | SQL Type |
|-----------------|--------|----------|
| string | - | VARCHAR(255) |
| string | date | DATE |
| string | date-time | TIMESTAMP |
| string | email | VARCHAR(255) |
| string | uri/url | VARCHAR(2048) |
| number | - | NUMERIC |
| integer | - | INTEGER |
| boolean | - | BOOLEAN |
| array | - | JSON |
| object | - | JSON |

## Examples

### Example 1: Converting Sales Cloud Board

```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import salesCloudBoard from './Boards/salescloud.json';

const schema = transformBoardToDrawDB(salesCloudBoard);

// Export to JSON file for use with drawDB
import fs from 'fs';
fs.writeFileSync('salescloud-drawdb.json', JSON.stringify(schema, null, 2));
```

### Example 2: Filtering Read-Only Fields

```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import insuranceBoard from './Boards/insurancePolicy.json';

// Exclude system fields like Id, CreatedDate, etc.
const schema = transformBoardToDrawDB(insuranceBoard, {
  includeReadOnlyFields: false
});
```

### Example 3: PostgreSQL Export

```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import serviceCloudBoard from './Boards/serviceCloud.json';

// Target PostgreSQL for better type compatibility
const schema = transformBoardToDrawDB(serviceCloudBoard, {
  defaultDatabase: 'postgresql'
});
```

## Relationship Handling

The transformer detects relationships based on:

1. **Edge Types**: Different edge types in the board template indicate different cardinalities
2. **Field Metadata**: Uses `x-target` field metadata to identify lookup relationships
3. **Handle Names**: Parses source and target handles to match fields

Relationships are created with appropriate constraints:
- **Update Constraint**: `NO ACTION` (default)
- **Delete Constraint**: `CASCADE` (default)

## Notes and Subject Areas

- **Group Zones**: Converted to drawDB subject areas with preserved dimensions and colors
- **Descriptions**: Table and field descriptions are preserved as comments
- **Icons**: Icon information is preserved in table metadata where supported

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

