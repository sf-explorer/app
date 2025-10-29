import { transformBoardToDrawDB } from './dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Read the Product Catalog board
const productCatalogPath = path.join(__dirname, '../../Boards/productCatalog.json');
const productCatalog = JSON.parse(fs.readFileSync(productCatalogPath, 'utf-8'));

console.log('📊 Comparison: Full vs Relationship-Only\n');
console.log('='.repeat(60));

// Generate full version
const full = transformBoardToDrawDB(productCatalog, {
  defaultDatabase: 'generic',
  title: 'Product Catalog - Full'
});

// Generate relationship-only version
const relationshipOnly = transformBoardToDrawDB(productCatalog, {
  defaultDatabase: 'generic',
  onlyRelationshipFields: true,
  title: 'Product Catalog - Relationships Only'
});

// Compare
const fullFields = full.tables.reduce((sum, table) => sum + table.fields.length, 0);
const relFields = relationshipOnly.tables.reduce((sum, table) => sum + table.fields.length, 0);
const reduction = ((1 - relFields / fullFields) * 100).toFixed(1);

console.log(`\n📈 FULL VERSION:`);
console.log(`   Tables: ${full.tables.length}`);
console.log(`   Total fields: ${fullFields}`);
console.log(`   Avg fields/table: ${(fullFields / full.tables.length).toFixed(1)}`);

console.log(`\n🎯 RELATIONSHIP-ONLY VERSION:`);
console.log(`   Tables: ${relationshipOnly.tables.length}`);
console.log(`   Total fields: ${relFields}`);
console.log(`   Avg fields/table: ${(relFields / relationshipOnly.tables.length).toFixed(1)}`);

console.log(`\n📉 REDUCTION: ${reduction}% fewer fields`);
console.log(`   (${fullFields} → ${relFields} fields)`);

console.log(`\n${'='.repeat(60)}`);
console.log('\n📋 Per-Table Comparison:\n');

full.tables.forEach((fullTable, i) => {
  const relTable = relationshipOnly.tables.find(t => t.name === fullTable.name);
  if (relTable) {
    const fullFieldCount = fullTable.fields.length;
    const relFieldCount = relTable.fields.length;
    const tableReduction = ((1 - relFieldCount / fullFieldCount) * 100).toFixed(0);
    
    console.log(`${i + 1}. ${fullTable.name}:`);
    console.log(`   Full: ${fullFieldCount} fields | Minimal: ${relFieldCount} fields | -${tableReduction}%`);
    console.log(`   Relationship fields: ${relTable.fields.map(f => f.name).join(', ')}`);
    console.log('');
  }
});

console.log('💡 Use onlyRelationshipFields: true for clean ERD diagrams focused on relationships!');
