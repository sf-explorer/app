/**
 * Example usage of @sf-explorer/board-to-drawdb
 */

import { transformBoardToDrawDB, ConversionOptions } from './src';
import * as fs from 'fs';
import * as path from 'path';

// Example 1: Basic conversion
async function basicExample() {
  console.log('=== Basic Conversion Example ===');
  
  // Load a board template
  const boardPath = path.join(__dirname, '../../Boards/actionPlan.json');
  const boardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
  
  // Convert to drawDB format
  const schema = transformBoardToDrawDB(boardTemplate);
  
  console.log(`Converted ${schema.tables.length} tables`);
  console.log(`Converted ${schema.relationships.length} relationships`);
  console.log(`Converted ${schema.subjectAreas?.length || 0} subject areas`);
  
  // Save the result
  const outputPath = path.join(__dirname, 'output-basic.json');
  fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
  console.log(`Saved to ${outputPath}\n`);
}

// Example 2: Conversion with options
async function optionsExample() {
  console.log('=== Conversion with Options Example ===');
  
  // Load a board template
  const boardPath = path.join(__dirname, '../../Boards/serviceCloud.json');
  const boardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
  
  // Convert with custom options
  const options: ConversionOptions = {
    includeReadOnlyFields: false,
    includeGroupZones: true,
    defaultDatabase: 'postgresql'
  };
  
  const schema = transformBoardToDrawDB(boardTemplate, options);
  
  console.log(`Database type: ${schema.database}`);
  console.log(`Converted ${schema.tables.length} tables`);
  console.log(`Converted ${schema.relationships.length} relationships\n`);
}

// Example 3: Process multiple boards
async function batchExample() {
  console.log('=== Batch Conversion Example ===');
  
  const boardsDir = path.join(__dirname, '../../Boards');
  const outputDir = path.join(__dirname, 'output');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  
  const boardFiles = fs.readdirSync(boardsDir)
    .filter(file => file.endsWith('.json'));
  
  console.log(`Processing ${boardFiles.length} board files...`);
  
  for (const file of boardFiles) {
    try {
      const boardPath = path.join(boardsDir, file);
      const boardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
      
      const schema = transformBoardToDrawDB(boardTemplate, {
        includeReadOnlyFields: false,
        defaultDatabase: 'generic'
      });
      
      const outputPath = path.join(outputDir, file.replace('.json', '-drawdb.json'));
      fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
      
      console.log(`✓ Converted ${file} (${schema.tables.length} tables, ${schema.relationships.length} relationships)`);
    } catch (error) {
      console.error(`✗ Error processing ${file}:`, error);
    }
  }
  
  console.log('\nBatch conversion complete!\n');
}

// Run examples
async function main() {
  try {
    await basicExample();
    await optionsExample();
    await batchExample();
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Execute if running directly
if (require.main === module) {
  main();
}

