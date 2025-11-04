import { transformBoardToDrawIO, BoardTemplate } from './src/index';
import fs from 'fs';
import path from 'path';

/**
 * Example: Transform all boards in the Boards directory to draw.io format
 */

const boardsDir = path.join(__dirname, '../../Boards');
const outputDir = path.join(__dirname, 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all JSON board files
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json') && !file.includes('boardTemplates'));

console.log(`Found ${boardFiles.length} board files\n`);

// Process each board
for (const boardFile of boardFiles) {
  const boardPath = path.join(boardsDir, boardFile);
  const boardName = path.basename(boardFile, '.json');
  
  try {
    console.log(`Processing: ${boardName}...`);
    
    // Read board data
    const boardData: BoardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
    
    // Transform to draw.io
    const drawioXml = transformBoardToDrawIO(boardData, {
      includeReadOnlyFields: false,  // Skip readonly for cleaner diagrams
      includeGroupZones: true,
      title: boardName,
      showFieldTypes: true,
      showDescriptions: false,
      tableWidth: 220,
      fieldHeight: 28,
    });
    
    // Save output
    const outputPath = path.join(outputDir, `${boardName}.drawio`);
    fs.writeFileSync(outputPath, drawioXml, 'utf-8');
    
    console.log(`  ✓ Generated: ${outputPath}`);
    console.log(`    Nodes: ${boardData.nodes.length}, Edges: ${boardData.edges.length}`);
    console.log(`    Size: ${(drawioXml.length / 1024).toFixed(2)} KB\n`);
    
  } catch (error) {
    console.error(`  ✗ Error processing ${boardName}:`, error);
  }
}

console.log('Done! Open the .drawio files with:');
console.log('  - draw.io desktop app');
console.log('  - https://app.diagrams.net');
console.log('  - VS Code with Draw.io Integration extension');



