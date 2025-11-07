#!/usr/bin/env node

/**
 * Generate viewer URLs for all boards
 * Usage: node generate-viewer-urls.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformBoardWithViewerUrl } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const boardsDir = path.join(__dirname, '../../Boards');
const outputFile = path.join(__dirname, 'viewer-urls.md');

// Get all JSON board files
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json')); // Generate URLs for all boards

console.log(`🔗 Generating viewer URLs for ${boardFiles.length} boards...\n`);

const urls = [];

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
    
    // Transform and get viewer URL
    const { xml, viewerUrl } = transformBoardWithViewerUrl(boardData, {
      includeReadOnlyFields: false,
      showFieldTypes: true,
      tableWidth: 220,
      fieldHeight: 28,
      title: boardName
    });
    
    const urlLength = viewerUrl.length;
    console.log(`✓ ${boardName}`);
    console.log(`  └─ URL length: ${urlLength.toLocaleString()} chars`);
    
    urls.push({
      name: boardName,
      url: viewerUrl,
      nodes: boardData.nodes.length,
      edges: boardData.edges.length,
      urlLength
    });
    
  } catch (error) {
    console.error(`✗ ${boardName}: ${error.message}`);
  }
}

// Generate markdown file with URLs
const markdown = `# Draw.io Viewer URLs

Generated: ${new Date().toISOString()}

Click on the links below to open the diagrams directly in draw.io viewer:

${urls.map(({ name, url, nodes, edges, urlLength }) => `
## ${name}

- **Nodes**: ${nodes}
- **Edges**: ${edges}
- **URL Length**: ${urlLength.toLocaleString()} characters

[🔗 Open ${name} in draw.io viewer](${url})

`).join('\n')}

## Notes

- These URLs contain the complete diagram encoded in base64
- URLs can be very long for complex diagrams (may exceed browser URL limits)
- For production use, consider hosting the .drawio files and using \`?url=\` parameter instead
- Browser URL limits: Chrome/Edge ~2MB, Firefox ~64KB, Safari ~80KB
`;

fs.writeFileSync(outputFile, markdown, 'utf-8');

console.log('\n' + '='.repeat(50));
console.log(`✅ Generated viewer URLs: ${urls.length}`);
console.log('='.repeat(50));
console.log('\n📄 Output file:', outputFile);
console.log('\n💡 Open viewer-urls.md to see clickable links');
