# Directory Structure

Clean and organized directory structure for the `@sf-explorer/board-to-drawio` package.

## 📁 Root Level (Essential Files Only)

```
board-to-drawio/
├── README.md           # Main package documentation
├── CHANGELOG.md        # Version history
├── LICENSE             # MIT License
├── package.json        # Package configuration
├── tsconfig.json       # TypeScript configuration
└── .gitignore         # Git ignore rules
```

## 📂 Main Directories

### `src/` - Source Code
TypeScript source files for the package.

```
src/
├── index.ts           # Main entry point with conversion logic
└── types.ts           # TypeScript type definitions
```

### `dist/` - Compiled Output
Generated JavaScript and type definitions (created by `npm run build`).

```
dist/
├── index.js           # Compiled main entry point
├── index.d.ts         # Type definitions
├── types.js           # Compiled types
└── types.d.ts         # Type definitions
```

### `docs/` - Documentation
All project documentation organized in one place.

```
docs/
├── README.md                    # Documentation index
├── QUICK_START.md              # 5-minute quick start guide
├── PROJECT_SUMMARY.md          # High-level overview
├── ALL_DIAGRAM_LINKS.md        # Links to all generated diagrams
├── ANNOTATION_FEATURE.md       # Annotation badge documentation
├── UML_FEATURE.md              # UML diagram style guide
├── viewer-urls.md              # Viewer URL technical details
└── RELEASE_NOTES_2.1.0.md     # Latest release notes
```

### `scripts/` - Utilities & Examples
Generation scripts, examples, and tests.

```
scripts/
├── README.md                        # Scripts documentation
├── regenerate-all.cjs               # Regenerate all diagrams
├── generate-all-links.js            # Generate links document
├── generate-viewer-urls.js          # Generate viewer URLs
├── generate-both-with-links.js      # Compare ERD vs UML
├── batch-convert.js                 # Batch conversion utility
├── example.ts                       # Basic TypeScript example
├── example-both-styles.js           # ERD vs UML example
├── example-highlight-custom-fields.js # Custom field highlighting
├── test.js                          # Main test suite
├── test-uml.ts                      # UML generation tests
├── test-viewer-url.js               # Viewer URL tests
├── browser-example.html             # Browser usage example
├── sample.drawio.xml                # Sample diagram file
└── test-swimlane.drawio             # Test diagram
```

### `output/` - Generated Diagrams
All generated `.drawio` files.

```
output/
├── DIAGRAM_LINKS.md           # Quick links to example diagrams
├── *.drawio                   # Generated diagram files
└── [17+ board diagrams]       # One for each board in ../../Boards/
```

### `plugins/` - Optional Plugins
Transformation plugins for customization.

```
plugins/
├── README.md                     # Plugin documentation
└── highlight-custom-fields.js   # Custom field highlighting plugin
```

## 🔍 Finding Things

| I want to... | Go to... |
|--------------|----------|
| Get started quickly | `docs/QUICK_START.md` |
| Learn about features | `docs/ANNOTATION_FEATURE.md`, `docs/UML_FEATURE.md` |
| See example diagrams | `docs/ALL_DIAGRAM_LINKS.md` |
| Run examples | `scripts/example*.js` |
| Generate diagrams | `scripts/regenerate-all.cjs` |
| Run tests | `npm test` or `scripts/test.js` |
| Understand the code | `src/index.ts` |
| Check version history | `CHANGELOG.md` |

## 🧹 Organization Benefits

✅ **Clean root** - Only essential config files  
✅ **Grouped docs** - All documentation in `docs/`  
✅ **Grouped scripts** - All utilities in `scripts/`  
✅ **Clear separation** - Source, output, and docs are distinct  
✅ **Easy navigation** - README files in each directory  

## 📦 Package Contents (npm publish)

When published, the package includes:
- ✅ `dist/` - Compiled JavaScript and types
- ✅ `README.md` - Main documentation
- ✅ `CHANGELOG.md` - Version history
- ✅ `LICENSE` - MIT License
- ✅ `package.json` - Package metadata

Excluded from npm package (development only):
- ❌ `src/` - TypeScript source (use dist/)
- ❌ `scripts/` - Development utilities
- ❌ `docs/` - Extended documentation (link to GitHub)
- ❌ `output/` - Generated examples

## 🚀 Quick Commands

```bash
# Build the package
npm run build

# Run tests
npm test

# Regenerate all diagrams
node scripts/regenerate-all.cjs

# Generate documentation links
node scripts/generate-all-links.js

# Try examples
npx tsx scripts/example.ts
node scripts/example-both-styles.js
```

---

*Last updated: 2025-11-06*


