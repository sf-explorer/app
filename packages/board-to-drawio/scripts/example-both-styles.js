// Example: Generate both ERD and UML diagrams from the same board
import { transformBoardToDrawIO } from '../dist/index.js';
import fs from 'fs';

const boardData = JSON.parse(fs.readFileSync('../../Boards/productCatalog.json', 'utf-8'));

console.log('Generating diagrams...\n');

// 1. ERD Style - Traditional database schema
const erd = transformBoardToDrawIO(boardData, {
  diagramStyle: 'erd',
  title: 'Product Catalog - ERD',
  showFieldTypes: true,
  includeReadOnlyFields: false,
  collapseTables: false,
  maxFields: 15,
});

fs.writeFileSync('output/example-erd.drawio', erd);
console.log('✅ ERD saved: output/example-erd.drawio');
console.log('   - Swimlane containers with separate field rows');
console.log('   - PK/FK prefixes (PK: Id, FK: AccountId)');
console.log('   - ER relationship arrows (ERone ⊳, ERmany ⊲⊳)');
console.log('   - Collapsible tables\n');

// 2. UML Style - Object-oriented class diagram
const uml = transformBoardToDrawIO(boardData, {
  diagramStyle: 'uml',
  title: 'Product Catalog - UML',
  showFieldTypes: true,
  includeReadOnlyFields: false,
  maxFields: 15,
  umlOptions: {
    showVisibilityMarkers: true,
    groupByVisibility: true,
    relationshipStyle: 'smart',
  },
});

fs.writeFileSync('output/example-uml.drawio', uml);
console.log('✅ UML saved: output/example-uml.drawio');
console.log('   - UML class boxes (shape=umlClass)');
console.log('   - Visibility markers (+ public, - private)');
console.log('   - UML relationships (◆ composition, → association)');
console.log('   - Fields grouped by type\n');

console.log('📊 Open both files in https://app.diagrams.net/ to compare!');



