import { transformBoardToDrawIO, type BoardTemplate } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Use the salesforce-data-models/data directory as the source
const boardsDir = path.join(__dirname, '../../salesforce-data-models/data');
const outputDir = path.join(__dirname, '../output');

/**
 * Main function to generate all board diagrams
 */
function main(): void {
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
      const boardContent = fs.readFileSync(boardPath, 'utf-8');
      const board: BoardTemplate = JSON.parse(boardContent);
      
      // Skip if not a valid board template
      if (!board.nodes || !board.edges) {
        console.log(`⊘ ${boardFile} (not a board template, skipping)`);
        continue;
      }
      
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
      
      console.log(`✓ ${boardName.padEnd(25)} → ${outputName} (${board.nodes.length} nodes, ${board.edges.length} edges)`);
      successCount++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ ${boardFile.padEnd(25)} → Error: ${errorMessage}`);
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
}

// Run the script
main();
