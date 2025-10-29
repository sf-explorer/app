# Changelog

All notable changes to @sf-explorer/board-to-drawdb will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-29

### Added
- Initial release of @sf-explorer/board-to-drawdb
- Core transformation function `transformBoardToDrawDB`
- Type definitions for BoardTemplate and DrawDBSchema
- Support for table conversion with field mapping
- Relationship detection and conversion
- Group zone to subject area transformation
- Configurable conversion options:
  - `includeReadOnlyFields` - control inclusion of read-only fields
  - `includeGroupZones` - control inclusion of group zones
  - `defaultDatabase` - target database type selection
- Type mapping from JSON Schema to SQL types
- Comprehensive documentation and examples
- TypeScript type definitions
- Test suite
- Example usage files

