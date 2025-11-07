#!/usr/bin/env node

/**
 * Example: Highlight Custom Fields in Salesforce ERD
 * 
 * This example demonstrates the highlightCustomFields option which
 * automatically highlights Salesforce custom fields (ending with __c)
 * with an orange background and border.
 */

import { transformBoardToDrawIO } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the Service Cloud board which has many custom fields
const boardPath = path.join(__dirname, '../../Boards/serviceCloud.json');
const outputDir = path.join(__dirname, 'output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('\n🎨 Generating ERD with Custom Fields Highlighted...\n');

try {
  const board = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
  
  // Generate diagram with custom fields highlighted
  const drawioXml = transformBoardToDrawIO(board, {
    title: 'Service Cloud - Custom Fields Highlighted',
    showFieldTypes: true,
    showDescriptions: false,
    collapseTables: false,
    highlightCustomFields: true, // ⭐ Enable custom field highlighting
    maxFields: 20,
  });
  
  const outputPath = path.join(outputDir, 'serviceCloud-custom-highlighted.drawio');
  fs.writeFileSync(outputPath, drawioXml, 'utf-8');
  
  console.log('✅ Generated diagram with custom fields highlighted:');
  console.log(`   ${outputPath}\n`);
  console.log('📋 Custom fields (ending with __c) will be shown with:');
  console.log('   - Orange background (#FFE6CC)');
  console.log('   - Orange border (#FF9900)');
  console.log('   - Thicker border (2px)\n');
  console.log('💡 Examples of custom fields in this diagram:');
  console.log('   - External_ID__c');
  console.log('   - SDO_Service_Cost__c');
  console.log('   - SDO_Status_Indicator__c');
  console.log('   - Case_Feedback__c');
  console.log('   - And many more!\n');
  console.log('📖 Open the file in Draw.io to see the highlighting!');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

// Also generate a comparison without highlighting
console.log('\n📊 Generating comparison diagram without highlighting...\n');

try {
  const board = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
  
  const drawioXml = transformBoardToDrawIO(board, {
    title: 'Service Cloud - Standard View',
    showFieldTypes: true,
    showDescriptions: false,
    collapseTables: false,
    highlightCustomFields: false, // ❌ Disabled
    maxFields: 20,
  });
  
  const outputPath = path.join(outputDir, 'serviceCloud-standard.drawio');
  fs.writeFileSync(outputPath, drawioXml, 'utf-8');
  
  console.log('✅ Generated standard diagram (no highlighting):');
  console.log(`   ${outputPath}\n`);
  console.log('🔄 Compare both files to see the difference!\n');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}



