#!/usr/bin/env node

/**
 * Batch convert all boards to draw.io format
 * Usage: node batch-convert.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformBoardToDrawIO } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const boardsDir = path.join(__dirname, '../../Boards');
const outputDir = path.join(__dirname, 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all JSON board files (exclude boardTemplates.ts)
const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json'));

console.log(`🚀 Starting batch conversion of ${boardFiles.length} boards...\n`);

let successCount = 0;
let errorCount = 0;

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
    
    // Transform to draw.io (using clean settings)
    const drawioXml = transformBoardToDrawIO(boardData, {
      includeReadOnlyFields: false,
      includeGroupZones: true,
      title: boardName
        .split(/(?=[A-Z])/)
        .join(' ')
        .replace(/^\w/, c => c.toUpperCase()),
      showFieldTypes: true,  // Show field types (name : type)
      showDescriptions: false,
      tableWidth: 220,
      fieldHeight: 28,
    });
    
    // Save output
    const outputPath = path.join(outputDir, `${boardName}.drawio`);
    fs.writeFileSync(outputPath, drawioXml, 'utf-8');
    
    console.log(`✓ ${boardName}`);
    console.log(`  └─ ${boardData.nodes.length} nodes, ${boardData.edges.length} edges → ${(drawioXml.length / 1024).toFixed(1)} KB`);
    
    successCount++;
    
  } catch (error) {
    console.error(`✗ ${boardName}`);
    console.error(`  └─ Error: ${error.message}`);
    errorCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`✅ Successfully converted: ${successCount}`);
if (errorCount > 0) {
  console.log(`❌ Failed to convert: ${errorCount}`);
}
console.log('='.repeat(50));

console.log('\n📂 Output directory:', outputDir);
console.log('\n💡 Open the .drawio files with:');
console.log('   • draw.io desktop app');
console.log('   • https://app.diagrams.net');
console.log('   • VS Code with Draw.io Integration extension');
