import { transformBoardToDrawIO, type BoardTemplate } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const boardsDir = path.join(__dirname, '../../../Boards');
const outputDir = path.join(__dirname, '../output');

/**
 * Main function to regenerate all board diagrams
 */
function main(): void {
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
      const boardContent = fs.readFileSync(boardPath, 'utf-8');
      const board: BoardTemplate = JSON.parse(boardContent);
      
      const boardName = path.basename(boardFile, '.json');
      const outputName = `${boardName}.drawio`;
      const outputPath = path.join(outputDir, outputName);
      
      // Generate draw.io XML with metadata
      const xml = transformBoardToDrawIO(board, {
        title: boardName,
        collapseTables: true,
        metadata: {
          author: 'SF Explorer',
          description: `Salesforce data model diagram: ${boardName}`,
          version: '2.2.0',
          repository: 'https://github.com/sf-explorer/app',
          created: new Date(),
        },
      });
      
      fs.writeFileSync(outputPath, xml, 'utf-8');
      
      console.log(`✓ ${boardName.padEnd(25)} → ${outputName}`);
      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ ${boardFile.padEnd(25)} → Error: ${errorMessage}`);
      failCount++;
    }
  }

  console.log(`\n${successCount} diagrams generated successfully`);
  if (failCount > 0) {
    console.log(`${failCount} diagrams failed`);
  }
}

// Run the script
main();
