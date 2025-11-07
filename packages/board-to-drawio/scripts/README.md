# Scripts

This directory contains utility scripts for generating, converting, and testing board-to-drawio functionality.

## 📁 Script Categories

### 🔄 Generation Scripts

#### `regenerate-all.cjs`
Regenerates all `.drawio` files from the Boards directory.

```bash
node scripts/regenerate-all.cjs
```

**What it does:**
- Scans `../../Boards/` for all `.json` files
- Converts each to `.drawio` format
- Saves to `output/` directory
- Shows success/failure summary

#### `generate-all-links.js`
Generates the comprehensive diagram links document.

```bash
node scripts/generate-all-links.js
```

**Output:** `docs/ALL_DIAGRAM_LINKS.md` with viewer URLs for all diagrams

#### `generate-viewer-urls.js`
Generates viewer URLs for sharing diagrams online.

```bash
node scripts/generate-viewer-urls.js
```

**Output:** Generates shareable links for diagram files

#### `generate-both-with-links.js`
Generates both ERD and UML versions with viewer links.

```bash
node scripts/generate-both-with-links.js
```

**Use case:** Compare ERD vs UML styles side-by-side

### 📝 Example Scripts

#### `example.ts`
Basic TypeScript example showing how to use the package.

```bash
npx tsx scripts/example.ts
```

#### `example-both-styles.js`
Example generating both ERD and UML diagrams.

```bash
node scripts/example-both-styles.js
```

#### `example-highlight-custom-fields.js`
Example showing custom field highlighting feature.

```bash
node scripts/example-highlight-custom-fields.js
```

**Uses plugin:** `plugins/highlight-custom-fields.js`

### 🧪 Test Scripts

#### `test.js`
Main test suite for the package.

```bash
npm test
# or
node scripts/test.js
```

**Tests:**
- Full conversion with all fields
- Clean conversion (no readonly fields)
- Simple conversion (minimal options)

#### `test-uml.ts`
Tests UML class diagram generation.

```bash
npx tsx scripts/test-uml.ts
```

#### `test-viewer-url.js`
Tests viewer URL generation.

```bash
node scripts/test-viewer-url.js
```

### 🔄 Batch Processing

#### `batch-convert.js`
Converts multiple boards at once with custom options.

```bash
node scripts/batch-convert.js
```

**Use case:** Bulk conversion with specific settings

## 📦 Common Workflows

### Regenerate Everything
```bash
# 1. Build the package
npm run build

# 2. Regenerate all diagrams
node scripts/regenerate-all.cjs

# 3. Generate links document
node scripts/generate-all-links.js
```

### Test Changes
```bash
# Build and test
npm run build
npm test
```

### Try Examples
```bash
# Basic example
npx tsx scripts/example.ts

# Compare styles
node scripts/example-both-styles.js

# Test custom field highlighting
node scripts/example-highlight-custom-fields.js
```

## 🔧 Script Requirements

Most scripts require the package to be built first:

```bash
npm run build
```

TypeScript scripts (`.ts`) can be run with `tsx`:

```bash
npx tsx scripts/example.ts
```

## 📊 Output Locations

- **Diagrams:** `output/*.drawio`
- **Links:** `docs/ALL_DIAGRAM_LINKS.md`
- **Test outputs:** `output/productCatalog-*.drawio`

## 🆘 Troubleshooting

**"Cannot find module './dist/index.js'"**
→ Run `npm run build` first

**"require is not defined"**
→ Use `.cjs` extension for CommonJS scripts

**TypeScript errors**
→ Use `npx tsx` for TypeScript scripts

---

*For more information, see the [main README](../README.md)*


