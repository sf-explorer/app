# @sf-explorer/board-to-drawdb - Project Summary

## Overview

This package provides a TypeScript function to transform SF Explorer board templates into drawDB-compatible format, enabling database diagram export and integration with other database design tools.

## What Was Created

### Package Structure
```
packages/board-to-drawdb/
├── src/
│   ├── index.ts           # Main transformation function
│   └── types.ts           # TypeScript type definitions
├── dist/                  # Compiled JavaScript (generated)
│   ├── index.js
│   ├── index.d.ts
│   ├── types.js
│   └── types.d.ts
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── .gitignore            # Git ignore rules
├── .npmignore            # npm publish ignore rules
├── README.md             # Full documentation
├── CHANGELOG.md          # Version history
├── example.ts            # Usage examples
├── test.ts               # Test suite
└── verify-build.js       # Build verification script
```

### Root Configuration Files
```
/
├── package.json           # Monorepo workspace configuration
├── tsconfig.json          # Base TypeScript configuration
└── Readme.md             # Updated with package documentation
```

## Key Features

### 1. Type Definitions (`src/types.ts`)
- **BoardTemplate Types**: Complete type definitions for SF Explorer board format
  - `BoardNode`, `BoardEdge`, `BoardTemplate`
  - `NodeData`, `TableData`, `JSONSchema`
- **DrawDB Types**: Complete type definitions for drawDB schema format
  - `DrawDBTable`, `DrawDBColumn`, `DrawDBRelationship`
  - `DrawDBNote`, `DrawDBArea`, `DrawDBSchema`
- **Conversion Options**: Configurable transformation behavior

### 2. Transformation Function (`src/index.ts`)
- **Main Export**: `transformBoardToDrawDB(board, options?)`
- **Table Conversion**: Converts board table nodes to drawDB tables
  - Preserves positioning
  - Maps field types (JSON Schema → SQL)
  - Handles primary keys, unique constraints
- **Relationship Detection**: Converts edges to foreign key relationships
  - Detects cardinality (one-to-one, one-to-many, many-to-one)
  - Uses field metadata (`x-target`) for lookup detection
  - Sets appropriate constraints
- **Group Zone Support**: Converts group zones to subject areas
  - Creates both subject areas and notes
  - Preserves dimensions and colors
- **Type Mapping**: Intelligent SQL type selection
  - Maps string → VARCHAR, date → DATE, etc.
  - Considers format hints (date-time → TIMESTAMP)

### 3. Configuration Options
```typescript
interface ConversionOptions {
  includeReadOnlyFields?: boolean;  // Default: true
  includeGroupZones?: boolean;      // Default: true
  defaultDatabase?: string;         // Default: 'generic'
}
```

Supported databases: `generic`, `postgresql`, `mysql`, `sqlite`, `mssql`

## Usage Examples

### Basic Usage
```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import boardTemplate from './Boards/salescloud.json';

const schema = transformBoardToDrawDB(boardTemplate);
```

### With Options
```typescript
const schema = transformBoardToDrawDB(boardTemplate, {
  includeReadOnlyFields: false,
  defaultDatabase: 'postgresql'
});
```

## Test Results

All tests pass successfully:
- ✓ Table conversion (2/2 tables)
- ✓ Relationship detection (1/1 relationships)
- ✓ Subject area conversion (1/1 areas)
- ✓ Read-only field filtering
- ✓ Group zone filtering
- ✓ Database type configuration

Sample output shows proper transformation of:
- Tables with fields and metadata
- Relationships with correct cardinality
- Subject areas with dimensions
- Notes with content

## Build Verification

- ✅ TypeScript compiles without errors
- ✅ JavaScript can be imported from dist/
- ✅ Type definitions are generated
- ✅ Function executes correctly
- ✅ No linter errors

## Documentation

1. **README.md**: Comprehensive usage guide with examples
2. **CHANGELOG.md**: Version history
3. **example.ts**: Practical usage examples including batch processing
4. **test.ts**: Test cases demonstrating functionality
5. **packages/README.md**: Monorepo package overview

## Monorepo Integration

- Uses npm workspaces for dependency management
- TypeScript project references for fast builds
- Consistent configuration across packages
- Independent versioning capability

## Future Enhancements

Potential additions for future versions:
- Validation of drawDB output
- Support for additional diagram formats
- Reverse transformation (drawDB → board)
- CLI tool for batch conversion
- Index generation from field metadata
- Custom type mapping configuration
- Diagram optimization (layout, grouping)

## Technical Details

### Type Mapping Logic
| JSON Schema | Format | SQL Type |
|------------|--------|----------|
| string | - | VARCHAR(255) |
| string | date | DATE |
| string | date-time | TIMESTAMP |
| string | email | VARCHAR(255) |
| number | - | NUMERIC |
| integer | - | INTEGER |
| boolean | - | BOOLEAN |
| array/object | - | JSON |

### Relationship Cardinality Detection
- Checks edge type (betweenTables, betweenTablesInverted)
- Examines field metadata (x-target property)
- Defaults to "Many to one" for lookup fields

### Constraint Defaults
- Update Constraint: `NO ACTION`
- Delete Constraint: `CASCADE`

## Dependencies

Production: None (zero dependencies)
Development:
- `typescript@^5.3.0`
- `@types/node@^20.0.0` (for examples)

## License

MIT

