/**
 * Test transformation of Product Catalog board template
 */

import { transformBoardToDrawDB } from './src';
import * as fs from 'fs';
import * as path from 'path';

console.log('=== Product Catalog Board Transformation Test ===\n');

// Load the product catalog board
const boardPath = path.join(__dirname, '../../Boards/productCatalog.json');
console.log(`Loading board from: ${boardPath}\n`);

const boardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));

// Test 1: Basic transformation
console.log('Test 1: Basic Transformation (all fields, all features)');
console.log('─'.repeat(60));
const schema1 = transformBoardToDrawDB(boardTemplate);

console.log(`✓ Tables converted: ${schema1.tables.length}`);
console.log(`✓ Relationships created: ${schema1.relationships.length}`);
console.log(`✓ Subject areas: ${schema1.subjectAreas?.length || 0}`);
console.log(`✓ Notes: ${schema1.notes?.length || 0}`);
console.log(`✓ Database type: ${schema1.database}\n`);

// Show table details
console.log('Tables:');
schema1.tables.forEach((table, idx) => {
  console.log(`  ${idx + 1}. ${table.name} (${table.fields.length} fields)`);
});
console.log();

// Show relationship details
console.log('Relationships:');
schema1.relationships.forEach((rel, idx) => {
  const startTable = schema1.tables.find(t => t.id === rel.startTableId);
  const endTable = schema1.tables.find(t => t.id === rel.endTableId);
  const startField = startTable?.fields.find(f => f.id === rel.startFieldId);
  const endField = endTable?.fields.find(f => f.id === rel.endFieldId);
  
  console.log(`  ${idx + 1}. ${startTable?.name}.${startField?.name} → ${endTable?.name}.${endField?.name}`);
  console.log(`     Cardinality: ${rel.cardinality}`);
});
console.log();

// Save full output
const outputPath1 = path.join(__dirname, 'output-product-catalog-full.json');
fs.writeFileSync(outputPath1, JSON.stringify(schema1, null, 2));
console.log(`✓ Full output saved to: ${outputPath1}\n`);

// Test 2: Without read-only fields
console.log('Test 2: Transformation without read-only fields');
console.log('─'.repeat(60));
const schema2 = transformBoardToDrawDB(boardTemplate, {
  includeReadOnlyFields: false
});

console.log(`✓ Tables converted: ${schema2.tables.length}`);
const totalFieldsWithReadOnly = schema1.tables.reduce((sum, t) => sum + t.fields.length, 0);
const totalFieldsWithoutReadOnly = schema2.tables.reduce((sum, t) => sum + t.fields.length, 0);
console.log(`✓ Total fields (with read-only): ${totalFieldsWithReadOnly}`);
console.log(`✓ Total fields (without read-only): ${totalFieldsWithoutReadOnly}`);
console.log(`✓ Fields filtered out: ${totalFieldsWithReadOnly - totalFieldsWithoutReadOnly}\n`);

// Test 3: Generic target (without read-only fields)
console.log('Test 3: Generic Database (Clean Output)');
console.log('─'.repeat(60));
const schema3 = transformBoardToDrawDB(boardTemplate, {
  defaultDatabase: 'generic',
  includeReadOnlyFields: false
});

console.log(`✓ Database type: ${schema3.database}`);
console.log(`✓ Tables: ${schema3.tables.length}`);
console.log(`✓ Relationships: ${schema3.relationships.length}\n`);

const outputPath3 = path.join(__dirname, 'output-product-catalog-clean.json');
fs.writeFileSync(outputPath3, JSON.stringify(schema3, null, 2));
console.log(`✓ Clean output saved to: ${outputPath3}\n`);

// Show sample table structure
console.log('Sample Table Structure (first table):');
console.log('─'.repeat(60));
const sampleTable = schema1.tables[0];
console.log(`Table: ${sampleTable.name}`);
console.log(`Comment: ${sampleTable.comment}`);
console.log(`Position: (${sampleTable.x}, ${sampleTable.y})`);
console.log(`Color: ${sampleTable.color}`);
console.log(`\nFields:`);
sampleTable.fields.slice(0, 5).forEach(field => {
  const constraints = [];
  if (field.primary) constraints.push('PRIMARY KEY');
  if (field.unique) constraints.push('UNIQUE');
  if (field.notNull) constraints.push('NOT NULL');
  
  console.log(`  - ${field.name}: ${field.type}${constraints.length ? ' [' + constraints.join(', ') + ']' : ''}`);
  if (field.comment) {
    console.log(`    ${field.comment}`);
  }
});
if (sampleTable.fields.length > 5) {
  console.log(`  ... and ${sampleTable.fields.length - 5} more fields`);
}
console.log();

// Show sample relationship
if (schema1.relationships.length > 0) {
  console.log('Sample Relationship:');
  console.log('─'.repeat(60));
  const sampleRel = schema1.relationships[0];
  const startTable = schema1.tables.find(t => t.id === sampleRel.startTableId);
  const endTable = schema1.tables.find(t => t.id === sampleRel.endTableId);
  const startField = startTable?.fields.find(f => f.id === sampleRel.startFieldId);
  const endField = endTable?.fields.find(f => f.id === sampleRel.endFieldId);
  
  console.log(`From: ${startTable?.name}.${startField?.name}`);
  console.log(`To: ${endTable?.name}.${endField?.name}`);
  console.log(`Cardinality: ${sampleRel.cardinality}`);
  console.log(`On Update: ${sampleRel.updateConstraint}`);
  console.log(`On Delete: ${sampleRel.deleteConstraint}`);
  console.log();
}

console.log('✅ All Product Catalog tests completed successfully!\n');

// Summary statistics
console.log('Summary Statistics:');
console.log('─'.repeat(60));
console.log(`Original board nodes: ${boardTemplate.nodes.length}`);
console.log(`Original board edges: ${boardTemplate.edges.length}`);
console.log(`Converted to tables: ${schema1.tables.length}`);
console.log(`Converted to relationships: ${schema1.relationships.length}`);
console.log(`Conversion rate: ${((schema1.tables.length / boardTemplate.nodes.filter((n: any) => n.type === 'table').length) * 100).toFixed(1)}%`);
console.log();

