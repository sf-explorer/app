import { transformBoardToDrawIO } from './src/index.js';
import fs from 'fs';
import path from 'path';

// Read the product catalog board
const boardPath = path.join(process.cwd(), '..', '..', 'Boards', 'productCatalog.json');
const boardData = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));

console.log('🔄 Generating UML class diagram from Product Catalog board...\n');

// Generate UML diagram with different options
const umlOutput = transformBoardToDrawIO(boardData, {
  diagramStyle: 'uml',
  title: 'Product Catalog UML Class Diagram',
  showFieldTypes: true,
  includeReadOnlyFields: false,
  maxFields: 15,
  umlOptions: {
    showVisibilityMarkers: true,
    groupByVisibility: true,
    relationshipStyle: 'smart',
  },
});

// Save UML output
const umlOutputPath = path.join(process.cwd(), 'output', 'productCatalog-uml.drawio');
fs.writeFileSync(umlOutputPath, umlOutput, 'utf-8');
console.log('✅ UML diagram saved:', umlOutputPath);

// Also generate traditional ERD for comparison
const erdOutput = transformBoardToDrawIO(boardData, {
  diagramStyle: 'erd',
  title: 'Product Catalog ERD',
  showFieldTypes: true,
  includeReadOnlyFields: false,
  maxFields: 15,
  collapseTables: false,
});

const erdOutputPath = path.join(process.cwd(), 'output', 'productCatalog-erd.drawio');
fs.writeFileSync(erdOutputPath, erdOutput, 'utf-8');
console.log('✅ ERD diagram saved:', erdOutputPath);

console.log('\n📊 Comparison:');
console.log('  UML style: Uses shape=umlClass with visibility markers (+ -)');
console.log('  ERD style: Uses swimlane containers with PK/FK prefixes');
console.log('\n🌐 Open these files in https://app.diagrams.net/ to view!');



