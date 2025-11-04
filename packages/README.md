# SF Explorer Packages

This directory contains reusable TypeScript packages for working with SF Explorer board templates and related functionality.

## Available Packages

### [@sf-explorer/board-to-drawdb](./board-to-drawdb)

Transform SF Explorer board templates into drawDB compatible format for database design and documentation.

**Features:**
- Convert ERD board templates to drawDB schema
- Configurable conversion options
- Type-safe TypeScript API
- Support for multiple database targets

**Quick Start:**
```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import boardTemplate from './Boards/salescloud.json';

const drawDBSchema = transformBoardToDrawDB(boardTemplate);
```

See the [full documentation](./board-to-drawdb/README.md) for more details.

### [@sf-explorer/board-to-drawio](./board-to-drawio)

Transform SF Explorer board templates into draw.io (diagrams.net) XML format for easy visualization and editing.

**Features:**
- Convert board templates to draw.io XML
- Full visual fidelity with colors and relationships
- Primary key and foreign key indicators
- Support for tables, group zones, and other node types
- ER diagram relationship arrows
- Customizable output options

**Quick Start:**
```typescript
import { transformBoardToDrawIO } from '@sf-explorer/board-to-drawio';
import boardTemplate from './Boards/salescloud.json';

const drawioXml = transformBoardToDrawIO(boardTemplate, {
  showFieldTypes: true,
  includeGroupZones: true
});
```

See the [full documentation](./board-to-drawio/README.md) for more details.

## Monorepo Structure

This repository uses npm workspaces for monorepo management. Each package:
- Has its own `package.json` and dependencies
- Can be built independently
- Can reference other packages in the workspace
- Has its own TypeScript configuration extending the root config

## Development

### Installing Dependencies

From the root of the repository:
```bash
npm install
```

This installs dependencies for all packages in the workspace.

### Building Packages

Build all packages:
```bash
npm run build
```

Build a specific package:
```bash
npm run build:board-to-drawdb
```

Or from within a package directory:
```bash
cd packages/board-to-drawdb
npm run build
```

### Testing

Each package may have its own test files. Run tests from the package directory:
```bash
cd packages/board-to-drawdb
npx ts-node test.ts
```

### Adding a New Package

1. Create a new directory under `packages/`
2. Initialize with `package.json` (name should be `@sf-explorer/package-name`)
3. Add `tsconfig.json` extending the root configuration
4. Add reference in root `tsconfig.json`
5. Implement your package in `src/`
6. Build and test

## Publishing

> Note: Publishing is not configured yet. This section will be updated when publishing is set up.

## Contributing

When contributing to packages:
1. Follow the existing TypeScript style and conventions
2. Add appropriate type definitions
3. Update documentation (README, examples)
4. Test your changes thoroughly
5. Update the root README if adding a new package

## License

MIT

