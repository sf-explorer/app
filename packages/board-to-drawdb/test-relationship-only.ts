import { transformBoardToDrawDB } from './dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Read the Product Catalog board
const productCatalogPath = path.join(__dirname, '../../Boards/productCatalog.json');
const productCatalog = JSON.parse(fs.readFileSync(productCatalogPath, 'utf-8'));

console.log('🔄 Generating relationship-only view (minimal fields)...\n');

// Generate with only relationship fields
const relationshipOnly = transformBoardToDrawDB(productCatalog, {
  defaultDatabase: 'generic',
  onlyRelationshipFields: true,
  title: 'Product Catalog - Relationships Only'
});

// Write to output
const outputPath = path.join(__dirname, 'output-product-catalog-relationships-only.json');
fs.writeFileSync(outputPath, JSON.stringify(relationshipOnly, null, 2));

// Statistics
const totalTables = relationshipOnly.tables.length;
const totalFields = relationshipOnly.tables.reduce((sum, table) => sum + table.fields.length, 0);
const avgFieldsPerTable = (totalFields / totalTables).toFixed(1);

console.log('✅ Generated relationship-only view:');
console.log(`   📊 Tables: ${totalTables}`);
console.log(`   📊 Total fields: ${totalFields}`);
console.log(`   📊 Average fields per table: ${avgFieldsPerTable}`);
console.log(`   📊 Relationships: ${relationshipOnly.relationships.length}`);
console.log(`\n📄 Output: ${outputPath}`);

// Show sample table
if (relationshipOnly.tables.length > 0) {
  const sampleTable = relationshipOnly.tables[0];
  console.log(`\n📋 Sample table: ${sampleTable.name}`);
  console.log(`   Fields (${sampleTable.fields.length}):`);
  sampleTable.fields.forEach(field => {
    console.log(`     - ${field.name} (${field.type})`);
  });
}

console.log('\n💡 Tip: Compare this with the full output to see the difference!');
console.log('   Full output has ~30-50 fields per table');
console.log('   Relationship-only has only Id + lookup fields (typically 3-8 per table)');

