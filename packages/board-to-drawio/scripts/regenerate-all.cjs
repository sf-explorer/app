const { transformBoardToDrawIO } = require('../dist/index.js');
const fs = require('fs');
const path = require('path');

const boardsDir = path.join(__dirname, '../../../Boards');
const outputDir = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all board files
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json'))
  .sort();

console.log(`\nRegenerating ${boardFiles.length} board diagrams with annotation support...\n`);

let successCount = 0;
let failCount = 0;

for (const boardFile of boardFiles) {
  try {
    const boardPath = path.join(boardsDir, boardFile);
    const board = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
    
    const boardName = path.basename(boardFile, '.json');
    const outputName = `${boardName}.drawio`;
    const outputPath = path.join(outputDir, outputName);
    
    // Generate draw.io XML
    const xml = transformBoardToDrawIO(board, {
      title: boardName,
      collapseTables: true,
    });
    
    fs.writeFileSync(outputPath, xml, 'utf-8');
    
    console.log(`✓ ${boardName.padEnd(25)} → ${outputName}`);
    successCount++;
  } catch (error) {
    console.error(`✗ ${boardFile.padEnd(25)} → Error: ${error.message}`);
    failCount++;
  }
}

console.log(`\n${successCount} diagrams generated successfully`);
if (failCount > 0) {
  console.log(`${failCount} diagrams failed`);
}

