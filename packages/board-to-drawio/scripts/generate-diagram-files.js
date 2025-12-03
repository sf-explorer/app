#!/usr/bin/env node

/**
 * Generate lightweight individual markdown files for each diagram
 * WITHOUT embedding the full viewer URLs (too large for GitHub)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const boardsDir = path.join(__dirname, '../../../Boards');
const diagramsDir = path.join(__dirname, '../docs/diagrams');
const viewerUrlsFile = path.join(__dirname, '../docs/viewer-urls.md');

// Ensure diagrams directory exists
if (!fs.existsSync(diagramsDir)) {
  fs.mkdirSync(diagramsDir, { recursive: true });
}

// Get all JSON board files
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json'))
  .sort();

console.log(`📊 Generating lightweight diagram files for ${boardFiles.length} diagrams...\n`);

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
    const displayName = boardName.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase());
    
    // Create lightweight diagram file (WITHOUT full viewer URL)
    const diagramMarkdown = `# ${displayName}

## 📊 Diagram Information

- **Nodes:** ${boardData.nodes.length} tables/entities
- **Edges:** ${boardData.edges.length} relationships
${hasAnnotation ? '- **⭐ Special:** Contains annotation badges\n' : ''}

## 🚀 How to View

### Option 1: Generate Locally (Recommended)
The best way to work with this diagram is to generate it locally:

\`\`\`bash
# From the package root
npm run build
node scripts/regenerate-all.cjs
\`\`\`

This creates \`output/${boardName}.drawio\` which you can:
- Open with [draw.io desktop app](https://github.com/jgraph/drawio-desktop/releases)
- Edit in [VS Code with Draw.io extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
- Upload to [app.diagrams.net](https://app.diagrams.net)

### Option 2: View Online
For the full viewer URL (may not work in all browsers), see:
**[viewer-urls.md](../viewer-urls.md)** - Look for "${displayName}" section

> ⚠️ **Note:** Viewer URLs are very long (embedded XML) and may not work in Firefox/Safari.  
> GitHub also doesn't render them well. We recommend Option 1.

## 🎨 Diagram Features

This diagram includes:
- ✅ **Collapsible tables** - Click +/− to expand/collapse field lists
- ✅ **Field tooltips** - Hover over fields for descriptions
- ✅ **Edge tooltips** - Hover over arrows to see relationship details
- ✅ **Primary keys** - Colored background and bold text
- ✅ **Foreign keys** - Grouped at top with "FK:" prefix
- ✅ **Enum types** - Fields with constrained values show as "Enum"
- ✅ **White field backgrounds** - Clean when tables overlap
- ✅ **Selective shadows** - Only on shapes for depth

## 📊 Technical Details

| Property | Value |
|----------|-------|
| Tables/Entities | ${boardData.nodes.length} |
| Relationships | ${boardData.edges.length} |
| Source File | \`../../Boards/${boardName}.json\` |
| Output File | \`output/${boardName}.drawio\` |

## 📚 Related

- [← Back to All Diagrams](../ALL_DIAGRAM_LINKS.md)
- [Full Documentation](../../README.md)
- [Quick Start Guide](../QUICK_START.md)
- [Viewer URLs (Technical)](../viewer-urls.md)

---

*Generate this diagram locally for the best experience!*
`;

    // Write lightweight diagram file
    const diagramFile = path.join(diagramsDir, `${boardName}.md`);
    fs.writeFileSync(diagramFile, diagramMarkdown, 'utf-8');
    
    console.log(`✓ ${boardName.padEnd(25)} → diagrams/${boardName}.md`);
    
    diagrams.push({
      name: boardName,
      displayName,
      nodes: boardData.nodes.length,
      edges: boardData.edges.length,
      hasAnnotation
    });
    
  } catch (error) {
    console.error(`✗ ${boardName}: ${error.message}`);
  }
}

// Generate index file
const indexMarkdown = `# 🔗 All Diagram Links

**Generated:** ${new Date().toLocaleString()}  
**Total Diagrams:** ${diagrams.length}

> 📊 **Each diagram has its own page** with generation instructions.  
> Viewer URLs are in [viewer-urls.md](./viewer-urls.md) (but we recommend generating locally).

---

## 📋 Quick Access

| # | Diagram | Nodes | Edges | Info |
|---|---------|-------|-------|------|
${diagrams.map((d, i) => `| ${i+1} | **${d.displayName}** | ${d.nodes} | ${d.edges} | [View →](./diagrams/${d.name}.md) |`).join('\n')}

---

## 🎨 Diagram Features

All diagrams include:
- ✅ **Collapsible tables** - Click +/− to expand/collapse
- ✅ **Field tooltips** - Hover for descriptions
- ✅ **Edge tooltips** - Hover arrows to see relationships
- ✅ **Primary keys** - Colored and bold
- ✅ **Foreign keys** - Grouped at top with FK prefix
- ✅ **Enum types** - Fields with constrained values
- ✅ **Proper shadows** - Only on shapes, not text
- ✅ **White field backgrounds** - Clean overlapping
- ✅ **Variable arrow widths** - Emphasis on important relationships

---

## 📊 Statistics

- **Total Diagrams:** ${diagrams.length}
- **Total Nodes:** ${diagrams.reduce((sum, d) => sum + d.nodes, 0)} tables/entities
- **Total Edges:** ${diagrams.reduce((sum, d) => sum + d.edges, 0)} relationships
- **Largest:** ${diagrams.sort((a, b) => b.nodes - a.nodes)[0].displayName} (${diagrams[0].nodes} nodes)
- **Smallest:** ${diagrams.sort((a, b) => a.nodes - b.nodes)[0].displayName} (${diagrams[0].nodes} nodes)

---

## 🚀 Usage

### Generate All Diagrams Locally
The recommended way to work with these diagrams:

\`\`\`bash
npm run build
node scripts/regenerate-all.cjs
\`\`\`

This creates all diagrams in the \`output/\` directory.

### View a Specific Diagram
1. Click on any diagram link in the table above
2. Follow the generation instructions on the diagram page
3. Open the generated \`.drawio\` file locally

### Work with Generated Files
After generating:
- Open with [draw.io desktop app](https://github.com/jgraph/drawio-desktop/releases)
- Or use [VS Code with Draw.io extension](https://marketplace.visualstudio.com/items?itemName=hediet.vscode-drawio)
- Or upload to [app.diagrams.net](https://app.diagrams.net)

---

## 📚 Documentation

- **[README](../README.md)** - Main package documentation
- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[ANNOTATION_FEATURE.md](./ANNOTATION_FEATURE.md)** - Annotation badges
- **[UML_FEATURE.md](./UML_FEATURE.md)** - UML class diagrams
- **[viewer-urls.md](./viewer-urls.md)** - Technical URL details (large file)

---

*Generated by board-to-drawio v2.1.0*
`;

// Write index file
fs.writeFileSync(path.join(__dirname, '../docs/ALL_DIAGRAM_LINKS.md'), indexMarkdown, 'utf-8');

console.log('\n' + '='.repeat(60));
console.log(`✅ Generated ${diagrams.length} lightweight diagram files`);
console.log('='.repeat(60));
console.log(`📄 Index: docs/ALL_DIAGRAM_LINKS.md`);
console.log(`📁 Files: docs/diagrams/*.md (GitHub-friendly sizes)`);
console.log('\n💡 View the index at docs/ALL_DIAGRAM_LINKS.md');
console.log('\n⚠️  Note: viewer-urls.md contains full URLs but is too large for GitHub');
