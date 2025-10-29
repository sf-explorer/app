import * as fs from 'fs';
import * as path from 'path';

// Read the Product Catalog board
const productCatalogPath = path.join(__dirname, '../../Boards/productCatalog.json');
const productCatalog = JSON.parse(fs.readFileSync(productCatalogPath, 'utf-8'));

console.log('🔍 Node IDs vs Table Types\n');

const tableNodes = productCatalog.nodes.filter(n => n.type === 'table');

console.log(`Total table nodes: ${tableNodes.length}\n`);

tableNodes.forEach((node, i) => {
  console.log(`${i + 1}. ID: ${node.id}`);
  console.log(`   Table name: ${node.data.table?.name || 'N/A'}`);
  console.log(`   Type: ${node.type}`);
  console.log('');
});

console.log('\n📝 Sample Edge Source/Target IDs:');
productCatalog.edges.slice(0, 5).forEach(edge => {
  console.log(`   Source: ${edge.source}`);
  console.log(`   Target: ${edge.target}`);
  console.log('');
});
