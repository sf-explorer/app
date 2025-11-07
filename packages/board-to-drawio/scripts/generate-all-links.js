#!/usr/bin/env node

/**
 * Generate comprehensive links document for all diagrams
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformBoardWithViewerUrl } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const boardsDir = path.join(__dirname, '../../../Boards');
const outputFile = path.join(__dirname, '../docs/ALL_DIAGRAM_LINKS.md');
const diagramsDir = path.join(__dirname, '../docs/diagrams');

// Get all JSON board files
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json'))
  .sort();

console.log(`📊 Generating comprehensive links for ${boardFiles.length} diagrams...\n`);

const diagrams = [];

// Process each board
for (const boardFile of boardFiles) {
  const boardPath = path.join(boardsDir, boardFile);
  const boardName = path.basename(boardFile, '.json');
  
  try {
    // Read board data
    const boardData = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
    
    // Skip if not a valid board template
    if (!boardData.nodes || !boardData.edges) {
      console.log(`⊘ ${boardName} (not a board template, skipping)`);
      continue;
    }
    
    // Check for annotation
    const hasAnnotation = boardData.nodes.some(n => n.data?.annotation);
    
    // Transform and get viewer URL
    const { xml, viewerUrl } = transformBoardWithViewerUrl(boardData, {
      includeReadOnlyFields: false,
      showFieldTypes: true,
      tableWidth: 220,
      fieldHeight: 28,
      title: boardName
    });
    
    const urlLength = viewerUrl.length;
    console.log(`✓ ${boardName.padEnd(25)} → ${urlLength.toLocaleString().padStart(10)} chars`);
    
    diagrams.push({
      name: boardName,
      displayName: boardName.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase()),
      url: viewerUrl,
      nodes: boardData.nodes.length,
      edges: boardData.edges.length,
      urlLength,
      hasAnnotation
    });
    
  } catch (error) {
    console.error(`✗ ${boardName}: ${error.message}`);
  }
}

// Generate comprehensive markdown
const markdown = `# 🔗 All Diagram Links

**Generated:** ${new Date().toLocaleString()}  
**Total Diagrams:** ${diagrams.length}

All diagrams include:
- ✅ Line separators after each field (\`line=1\`)
- ✅ Non-movable fields (\`movable="0"\`)
- ✅ Annotation badge support (where applicable)

---

## 📋 Quick Access Table

| # | Diagram | Nodes | Edges | URL Size | Special Features |
|---|---------|-------|-------|----------|------------------|
${diagrams.map((d, i) => `| ${i+1} | [${d.displayName}](#${d.name.toLowerCase().replace(/\s+/g, '-')}) | ${d.nodes} | ${d.edges} | ${(d.urlLength/1024).toFixed(1)}KB | ${d.hasAnnotation ? '⭐ Annotation' : '-'} |`).join('\n')}

---

## 🎯 Direct Viewer Links

${diagrams.map((d, i) => `### ${i+1}. ${d.displayName}

**File:** \`output/${d.name}.drawio\`  
**Nodes:** ${d.nodes} tables/entities  
**Edges:** ${d.edges} relationships  
**URL Length:** ${d.urlLength.toLocaleString()} characters (${(d.urlLength/1024).toFixed(1)}KB)  
${d.hasAnnotation ? '**⭐ Special:** Contains annotation badges\n' : ''}
[🔗 **Open in draw.io viewer →**](${d.url})

<details>
<summary>📋 Full URL (click to expand)</summary>

\`\`\`
${d.url}
\`\`\`

</details>

---
`).join('\n')}

## 🎨 Diagram Styles

This package supports two diagram styles:

### ERD (Entity-Relationship Diagram)
- **Best for:** Database schemas, Salesforce data models
- **Features:** 
  - Collapsible tables (swimlane style)
  - PK/FK prefixes
  - Crow's foot notation for relationships
  - Field-level tooltips
  - Color-coded by object type

### UML (Class Diagram)
- **Best for:** Object-oriented models, API documentation
- **Features:**
  - UML class boxes
  - Visibility markers (+ public, - private)
  - UML composition/aggregation arrows
  - Standard UML 2.x notation

See [DIAGRAM_LINKS.md](DIAGRAM_LINKS.md) for Product Catalog examples in both styles.

---

## ⚙️ Features Explained

### Line Separators
Each table field has a subtle horizontal line below it for better visual distinction:
\`\`\`xml
<mxCell style="...;line=1;" vertex="1" ...>
\`\`\`

### Non-Movable Fields
Individual fields are locked to their parent table and cannot be moved independently:
\`\`\`xml
<mxCell ... movable="0">
\`\`\`

### Annotation Badges
Tables can display metadata badges (e.g., "20k" for Salesforce record limits):
- Orange rounded badge at top-right corner
- Automatically groups table + badge together
- Currently enabled on Service Cloud > Case table

To add annotations to your diagrams, add the \`annotation\` property to any table in your board JSON:
\`\`\`json
{
  "id": "Case",
  "type": "table",
  "data": {
    "label": "Case",
    "annotation": "20k"
  }
}
\`\`\`

---

## ⚠️ Browser URL Limits

Some diagrams have very long URLs that may exceed browser limits:

| Browser | Maximum URL Length | Compatibility |
|---------|-------------------|---------------|
| **Chrome/Edge** | ~2MB | ✅ All diagrams work |
| **Firefox** | ~64KB | ⚠️ Large diagrams may fail |
| **Safari** | ~80KB | ⚠️ Large diagrams may fail |

### Diagrams over 64KB:
${diagrams.filter(d => d.urlLength > 65536).map(d => `- **${d.displayName}**: ${(d.urlLength/1024).toFixed(1)}KB`).join('\n')}

### Solutions for Large Diagrams:
1. **Host the files:** Upload \`.drawio\` files to a web server
2. **Use URL parameter:** \`https://viewer.diagrams.net/?url=https://your-server.com/diagram.drawio\`
3. **Open locally:** Download and open in draw.io desktop app
4. **Download files:** All files are in the \`output/\` directory

---

## 📚 Related Documentation

- **[README.md](README.md)** - Full documentation and usage guide
- **[ANNOTATION_FEATURE.md](ANNOTATION_FEATURE.md)** - Annotation badge feature details
- **[DIAGRAM_LINKS.md](DIAGRAM_LINKS.md)** - Product Catalog ERD vs UML comparison
- **[viewer-urls.md](viewer-urls.md)** - Technical details and raw URLs

---

## 🚀 How to Use These Links

### 1. View in Browser
Click any "🔗 Open in draw.io viewer" link to open the diagram directly in your browser.

### 2. Edit Online
1. Click a viewer link
2. Click "Edit" in draw.io viewer
3. Make changes
4. Download or save to cloud storage

### 3. Open Locally
1. Download the \`.drawio\` file from the \`output/\` directory
2. Open in draw.io desktop app
3. Edit and save locally

### 4. Share with Team
- Copy viewer URL and share via email, Slack, Teams, etc.
- Recipients can view without downloading
- Works on any device with a browser

---

## 📊 Statistics

- **Total Diagrams:** ${diagrams.length}
- **Total Nodes:** ${diagrams.reduce((sum, d) => sum + d.nodes, 0)}
- **Total Edges:** ${diagrams.reduce((sum, d) => sum + d.edges, 0)}
- **Largest Diagram:** ${diagrams.sort((a, b) => b.urlLength - a.urlLength)[0].displayName} (${(diagrams[0].urlLength/1024).toFixed(1)}KB)
- **Smallest Diagram:** ${diagrams.sort((a, b) => a.urlLength - b.urlLength)[0].displayName} (${(diagrams[0].urlLength/1024).toFixed(1)}KB)

---

*Generated by board-to-drawio converter v2.0.0*  
*Last updated: ${new Date().toISOString()}*
`;

// Write the file
fs.writeFileSync(outputFile, markdown, 'utf-8');

console.log('\n' + '='.repeat(60));
console.log(`✅ Generated comprehensive links document`);
console.log('='.repeat(60));
console.log(`📄 Output: ${outputFile}`);
console.log(`📊 Diagrams: ${diagrams.length}`);
console.log(`📏 Total size: ${(diagrams.reduce((sum, d) => sum + d.urlLength, 0) / 1024 / 1024).toFixed(2)}MB`);
console.log('\n💡 Open ALL_DIAGRAM_LINKS.md to access all diagram viewer links');

