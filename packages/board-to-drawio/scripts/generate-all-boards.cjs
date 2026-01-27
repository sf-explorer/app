const { transformBoardToDrawIO } = require('../dist/index.js');
const fs = require('fs');
const path = require('path');

// Use the salesforce-data-models/data directory as the source
const boardsDir = path.join(__dirname, '../../salesforce-data-models/data');
const outputDir = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all JSON board files (exclude boardTemplates.ts and component.json)
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json') && file !== 'component.json')
  .sort();

console.log(`\nGenerating ${boardFiles.length} drawio board diagrams...\n`);

let successCount = 0;
let failCount = 0;

for (const boardFile of boardFiles) {
  try {
    const boardPath = path.join(boardsDir, boardFile);
    const board = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
    
    // Skip if not a valid board template
    if (!board.nodes || !board.edges) {
      console.log(`⊘ ${boardFile} (not a board template, skipping)`);
      continue;
    }
    
    const boardName = path.basename(boardFile, '.json');
    const outputName = `${boardName}.drawio`;
    const outputPath = path.join(outputDir, outputName);
    
    // Generate draw.io XML
    const xml = transformBoardToDrawIO(board, {
      title: boardName,
      collapseTables: false,
    });
    
    fs.writeFileSync(outputPath, xml, 'utf-8');
    
    console.log(`✓ ${boardName.padEnd(25)} → ${outputName} (${board.nodes.length} nodes, ${board.edges.length} edges)`);
    successCount++;
  } catch (error) {
    console.error(`✗ ${boardFile.padEnd(25)} → Error: ${error.message}`);
    failCount++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ ${successCount} diagrams generated successfully`);
if (failCount > 0) {
  console.log(`❌ ${failCount} diagrams failed`);
}
console.log(`📂 Output directory: ${outputDir}`);
console.log('='.repeat(60));
