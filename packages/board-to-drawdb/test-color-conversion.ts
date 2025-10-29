import { transformBoardToDrawDB } from './dist/index.js';
import * as fs from 'fs';
import * as path from 'path';

// Read the Product Catalog board
const productCatalogPath = path.join(__dirname, '../../Boards/productCatalog.json');
const productCatalog = JSON.parse(fs.readFileSync(productCatalogPath, 'utf-8'));

console.log('🎨 Testing Color Conversion\n');

const result = transformBoardToDrawDB(productCatalog, {
  defaultDatabase: 'generic'
});

// Check some colors
console.log('📊 Sample Colors:\n');

if (result.tables.length > 0) {
  console.log('Tables:');
  result.tables.slice(0, 3).forEach(table => {
    console.log(`  ${table.name}: ${table.color}`);
  });
}

if (result.subjectAreas && result.subjectAreas.length > 0) {
  console.log('\nSubject Areas:');
  result.subjectAreas.forEach(area => {
    console.log(`  ${area.name}: ${area.color}`);
  });
}

if (result.notes && result.notes.length > 0) {
  console.log('\nNotes:');
  result.notes.forEach(note => {
    console.log(`  ${note.title}: ${note.color}`);
  });
}

// Save output
const outputPath = path.join(__dirname, 'output/productCatalog-drawdb.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`\n✅ Saved to: ${outputPath}`);
