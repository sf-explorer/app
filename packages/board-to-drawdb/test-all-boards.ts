/**
 * Batch test all board templates
 */

import { transformBoardToDrawDB } from './src';
import * as fs from 'fs';
import * as path from 'path';

const boardsDir = path.join(__dirname, '../../Boards');
const outputDir = path.join(__dirname, 'output');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

console.log('=== Batch Board Transformation Test ===\n');

const boardFiles = fs.readdirSync(boardsDir)
  .filter(file => file.endsWith('.json') && file !== 'component.json');

console.log(`Found ${boardFiles.length} board templates to process\n`);

const results: Array<{
  name: string;
  success: boolean;
  tables: number;
  relationships: number;
  fields: number;
  error?: string;
}> = [];

for (const file of boardFiles) {
  try {
    const boardPath = path.join(boardsDir, file);
    const boardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
    
    const schema = transformBoardToDrawDB(boardTemplate, {
      includeReadOnlyFields: false,
      defaultDatabase: 'generic'
    });
    
    const totalFields = schema.tables.reduce((sum, t) => sum + t.fields.length, 0);
    
    results.push({
      name: file.replace('.json', ''),
      success: true,
      tables: schema.tables.length,
      relationships: schema.relationships.length,
      fields: totalFields
    });
    
    // Save output
    const outputPath = path.join(outputDir, file.replace('.json', '-drawdb.json'));
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    
    console.log(`✓ ${file}`);
    console.log(`  Tables: ${schema.tables.length}, Relationships: ${schema.relationships.length}, Fields: ${totalFields}`);
  } catch (error) {
    results.push({
      name: file.replace('.json', ''),
      success: false,
      tables: 0,
      relationships: 0,
      fields: 0,
      error: String(error)
    });
    console.log(`✗ ${file} - Error: ${error}`);
  }
}

console.log('\n' + '='.repeat(60));
console.log('Summary Report');
console.log('='.repeat(60));

const successful = results.filter(r => r.success);
const failed = results.filter(r => !r.success);

console.log(`\nTotal boards processed: ${results.length}`);
console.log(`Successful: ${successful.length}`);
console.log(`Failed: ${failed.length}`);

if (successful.length > 0) {
  console.log('\nStatistics:');
  const totalTables = successful.reduce((sum, r) => sum + r.tables, 0);
  const totalRelationships = successful.reduce((sum, r) => sum + r.relationships, 0);
  const totalFields = successful.reduce((sum, r) => sum + r.fields, 0);
  
  console.log(`  Total tables: ${totalTables}`);
  console.log(`  Total relationships: ${totalRelationships}`);
  console.log(`  Total fields: ${totalFields}`);
  console.log(`  Average tables per board: ${(totalTables / successful.length).toFixed(1)}`);
  console.log(`  Average relationships per board: ${(totalRelationships / successful.length).toFixed(1)}`);
}

console.log('\nTop 5 largest boards:');
successful
  .sort((a, b) => b.tables - a.tables)
  .slice(0, 5)
  .forEach((r, idx) => {
    console.log(`  ${idx + 1}. ${r.name}: ${r.tables} tables, ${r.fields} fields`);
  });

console.log(`\n✅ All outputs saved to: ${outputDir}\n`);
