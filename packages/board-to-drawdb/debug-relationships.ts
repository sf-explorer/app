import { transformBoardToDrawDB } from './dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Read the Product Catalog board
const productCatalogPath = path.join(__dirname, '../../Boards/productCatalog.json');
const productCatalog = JSON.parse(fs.readFileSync(productCatalogPath, 'utf-8'));

console.log('🔍 Debugging Product Catalog Relationships\n');

// Check if edges exist
console.log(`📊 Edges in board: ${productCatalog.edges?.length || 0}`);

if (productCatalog.edges && productCatalog.edges.length > 0) {
  console.log('\n📝 Edge details:');
  productCatalog.edges.forEach((edge, i) => {
    console.log(`\n${i + 1}. ${edge.id}`);
    console.log(`   Source: ${edge.source} (${edge.sourceHandle})`);
    console.log(`   Target: ${edge.target} (${edge.targetHandle})`);
    console.log(`   Type: ${edge.type}`);
  });
}

// Transform
const result = transformBoardToDrawDB(productCatalog, {
  defaultDatabase: 'generic'
});

console.log(`\n✅ Transformation complete`);
console.log(`   Tables: ${result.tables.length}`);
console.log(`   Relationships: ${result.relationships.length}`);

if (result.relationships.length > 0) {
  console.log('\n📈 Generated relationships:');
  result.relationships.forEach((rel, i) => {
    console.log(`${i + 1}. ${rel.name} (${rel.cardinality})`);
  });
} else {
  console.log('\n❌ No relationships generated!');
}
