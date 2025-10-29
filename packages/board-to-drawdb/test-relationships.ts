/**
 * Test to debug relationship detection
 */

import { transformBoardToDrawDB } from './src';
import * as fs from 'fs';
import * as path from 'path';

console.log('=== Relationship Detection Debug Test ===\n');

// Load salescloud board (has many relationships)
const boardPath = path.join(__dirname, '../../Boards/salescloud.json');
const boardTemplate = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));

console.log(`Board: salescloud.json`);
console.log(`Total nodes: ${boardTemplate.nodes.length}`);
console.log(`Total edges: ${boardTemplate.edges.length}`);

// Count table nodes
const tableNodes = boardTemplate.nodes.filter((n: any) => n.type === 'table');
console.log(`Table nodes: ${tableNodes.length}`);

// Count valid table nodes (with names)
const validTableNodes = tableNodes.filter((n: any) => n.data.table && n.data.table.name);
console.log(`Valid table nodes (with names): ${validTableNodes.length}\n`);

// Show first few table node IDs
console.log('Sample table node IDs:');
validTableNodes.slice(0, 5).forEach((n: any) => {
  console.log(`  - ${n.id}: ${n.data.table.name}`);
  // Show a sample field
  if (n.data.schema && n.data.schema.properties) {
    const fields = Object.keys(n.data.schema.properties);
    console.log(`    Fields: ${fields.slice(0, 3).join(', ')}`);
  }
});
console.log();

// Show first few edges
console.log('Sample edges:');
boardTemplate.edges.slice(0, 5).forEach((e: any) => {
  console.log(`  - ${e.source} → ${e.target}`);
  console.log(`    Handles: ${e.sourceHandle} → ${e.targetHandle}`);
  
  // Extract field names
  const sourceFieldName = e.sourceHandle?.replace(/-source.*$/, '');
  const targetFieldName = e.targetHandle?.replace(/-target.*$/, '');
  console.log(`    Fields: ${sourceFieldName} → ${targetFieldName}`);
  
  // Check if source and target exist in valid tables
  const sourceExists = validTableNodes.some((n: any) => n.id === e.source);
  const targetExists = validTableNodes.some((n: any) => n.id === e.target);
  console.log(`    Valid: source=${sourceExists}, target=${targetExists}\n`);
});

// Transform and check results
console.log('Transforming...\n');
const schema = transformBoardToDrawDB(boardTemplate);

console.log(`Result:`);
console.log(`  Tables: ${schema.tables.length}`);
console.log(`  Relationships: ${schema.relationships.length}`);
console.log();

if (schema.relationships.length > 0) {
  console.log('✅ Relationships detected!');
  schema.relationships.slice(0, 3).forEach((rel, idx) => {
    const startTable = schema.tables.find(t => t.id === rel.startTableId);
    const endTable = schema.tables.find(t => t.id === rel.endTableId);
    console.log(`  ${idx + 1}. ${startTable?.name} → ${endTable?.name} (${rel.cardinality})`);
  });
} else {
  console.log('❌ No relationships detected - debugging needed');
  
  // Let's manually check if the first edge should create a relationship
  const firstEdge = boardTemplate.edges[0];
  console.log('\nDebugging first edge:');
  console.log(`  Source: ${firstEdge.source}`);
  console.log(`  Target: ${firstEdge.target}`);
  console.log(`  Source handle: ${firstEdge.sourceHandle}`);
  console.log(`  Target handle: ${firstEdge.targetHandle}`);
  
  const sourceTable = schema.tables.find((t: any) => {
    const sourceNode = validTableNodes.find((n: any) => n.id === firstEdge.source);
    return sourceNode && t.name === sourceNode.data.table.name;
  });
  const targetTable = schema.tables.find((t: any) => {
    const targetNode = validTableNodes.find((n: any) => n.id === firstEdge.target);
    return targetNode && t.name === targetNode.data.table.name;
  });
  
  console.log(`  Source table found: ${sourceTable ? sourceTable.name : 'NO'}`);
  console.log(`  Target table found: ${targetTable ? targetTable.name : 'NO'}`);
  
  if (sourceTable && targetTable) {
    const sourceFieldName = firstEdge.sourceHandle?.replace(/-source.*$/, '');
    const targetFieldName = firstEdge.targetHandle?.replace(/-target.*$/, '');
    
    const sourceField = sourceTable.fields.find((f: any) => f.name === sourceFieldName);
    const targetField = targetTable.fields.find((f: any) => f.name === targetFieldName);
    
    console.log(`  Source field (${sourceFieldName}): ${sourceField ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`  Target field (${targetFieldName}): ${targetField ? 'FOUND' : 'NOT FOUND'}`);
    
    if (!sourceField) {
      console.log(`  Available source fields: ${sourceTable.fields.map((f: any) => f.name).join(', ')}`);
    }
    if (!targetField) {
      console.log(`  Available target fields: ${targetTable.fields.map((f: any) => f.name).join(', ')}`);
    }
  }
}

