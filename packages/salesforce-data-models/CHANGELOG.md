# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-12-08

### Added
- Enum optimization scripts to reduce file sizes
  - `slice-enums.cjs` - Slice large enums in individual files
  - `slice-all-enums.cjs` - Batch process all data models
  - npm scripts: `npm run slice-enums` and `npm run slice-enums:single`
- Documentation for scripts in `scripts/README.md`

### Changed
- Optimized all data models by limiting enum/enumNames arrays to 30 values
- Reduced total package size from 4.52 MB to 2.83 MB (37.44% reduction)
- Individual model size reductions:
  - salescloud.json: 66.58% smaller
  - agentForce.json: 74.57% smaller
  - euc.json: 41.29% smaller
  - fieldService.json: 32.74% smaller
  - billingAccounting.json: 33.56% smaller
  - security.json: 27.44% smaller
  - Other models: 4-20% reductions
- Updated README with optimization details

## [1.0.0] - 2024-12-03

### Added
- Initial release of @sf-explorer/salesforce-data-models
- 17+ comprehensive Salesforce data models covering:
  - Core Clouds: Service Cloud, Sales Cloud, Data Cloud
  - Revenue Cloud Advanced: Product Catalog, Invoicing
  - Financial Services Cloud: Insurance, KYC
  - Field Service Lightning
  - Energy & Utilities Cloud
  - Platform & Security: Shield Events, Security Model, Business Rule Engine
  - AI & Analytics: Agentforce, Agent Feedback, Agent Interactions
  - Discovery Framework and Action Plans
- TypeScript support with full type definitions
- Helper functions for filtering and searching models
- Category system for organizing models
- Lazy loading for optimal performance
- ESM module format with tree-shaking support
- Comprehensive documentation and usage examples

