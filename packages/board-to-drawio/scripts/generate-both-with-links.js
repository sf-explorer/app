// Generate both ERD and UML diagrams with viewer URLs
import { transformBoardToDrawIO, generateViewerUrl } from '../dist/index.js';
import fs from 'fs';

const boardData = JSON.parse(fs.readFileSync('../../Boards/productCatalog.json', 'utf-8'));

console.log('🔄 Generating diagrams with viewer URLs...\n');

// 1. ERD Style with viewer URL
console.log('📊 ERD Style (Entity-Relationship Diagram)');
console.log('━'.repeat(50));

const erdXml = transformBoardToDrawIO(boardData, {
  diagramStyle: 'erd',
  title: 'Product Catalog - ERD',
  showFieldTypes: true,
  includeReadOnlyFields: false,
  collapseTables: false,
  maxFields: 15,
});

const erdUrl = generateViewerUrl(erdXml);

fs.writeFileSync('output/productCatalog-erd-with-link.drawio', erdXml);
console.log('✅ File: output/productCatalog-erd-with-link.drawio');
console.log('🌐 Viewer URL:');
console.log(erdUrl);
console.log('\nFeatures:');
console.log('  • Swimlane containers with collapsible tables');
console.log('  • PK/FK prefixes (PK: Id, FK: AccountId)');
console.log('  • ER relationship arrows (ERone ⊳, ERmany ⊲⊳)');
console.log('  • Separate field rows with tooltips');
console.log('  • Click +/- to expand/collapse tables\n');

// 2. UML Style with viewer URL
console.log('🎯 UML Style (Class Diagram)');
console.log('━'.repeat(50));

const umlXml = transformBoardToDrawIO(boardData, {
  diagramStyle: 'uml',
  title: 'Product Catalog - UML',
  showFieldTypes: true,
  includeReadOnlyFields: false,
  maxFields: 15,
  umlOptions: {
    showVisibilityMarkers: true,
    groupByVisibility: true,
    relationshipStyle: 'smart',
  },
});

const umlUrl = generateViewerUrl(umlXml);

fs.writeFileSync('output/productCatalog-uml-with-link.drawio', umlXml);
console.log('✅ File: output/productCatalog-uml-with-link.drawio');
console.log('🌐 Viewer URL:');
console.log(umlUrl);
console.log('\nFeatures:');
console.log('  • UML class boxes (shape=umlClass)');
console.log('  • Visibility markers (+ public, - private)');
console.log('  • UML composition (◆) for FK relationships');
console.log('  • Fields grouped by type (PK → regular → FK)');
console.log('  • Standard UML 2.x notation\n');

// 3. Save URLs to a markdown file
const markdown = `# Product Catalog Diagram Links

## ERD Style (Entity-Relationship Diagram)

**File:** \`output/productCatalog-erd-with-link.drawio\`

**Viewer URL:** [Open in draw.io viewer](${erdUrl})

### Features:
- Swimlane containers with collapsible tables
- PK/FK prefixes (PK: Id, FK: AccountId)
- ER relationship arrows (ERone ⊳, ERmany ⊲⊳)
- Separate field rows with tooltips
- Click +/- to expand/collapse tables

---

## UML Style (Class Diagram)

**File:** \`output/productCatalog-uml-with-link.drawio\`

**Viewer URL:** [Open in draw.io viewer](${umlUrl})

### Features:
- UML class boxes (shape=umlClass)
- Visibility markers (+ public, - private)
- UML composition (◆) for FK relationships
- Fields grouped by type (PK → regular → FK)
- Standard UML 2.x notation

---

## Quick Comparison

| Aspect | ERD Style | UML Style |
|--------|-----------|-----------|
| **File Size** | ~81KB | ~19KB |
| **Shape Type** | Swimlane containers | UML class boxes |
| **Field Format** | \`PK: Id : Text\` | \`+ Id : Text\` |
| **Relationships** | ER notation (crow's foot) | UML composition/association |
| **Collapsible** | ✅ Yes | ❌ No |
| **Best For** | Database schemas | Object models |

---

*Generated: ${new Date().toLocaleString()}*
`;

fs.writeFileSync('output/DIAGRAM_LINKS.md', markdown);
console.log('📝 Links saved to: output/DIAGRAM_LINKS.md\n');

console.log('✨ Done! You can:');
console.log('  1. Click the URLs above to open directly in your browser');
console.log('  2. Share the URLs via email, Slack, Teams, etc.');
console.log('  3. Open the .drawio files locally in draw.io app');
console.log('  4. Check output/DIAGRAM_LINKS.md for formatted links\n');



