import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformBoardToDrawIO } from './dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test with productCatalog board
console.log('Testing board-to-drawio transformer...\n');

const boardPath = path.join(__dirname, '../../Boards/productCatalog.json');
const outputDir = path.join(__dirname, 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

try {
  // Read the board file
  const boardData = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));
  console.log(`✓ Loaded board: ${boardPath}`);
  console.log(`  Nodes: ${boardData.nodes.length}`);
  console.log(`  Edges: ${boardData.edges.length}\n`);

  // Test 1: Full conversion with all options
  console.log('Test 1: Full conversion with all fields...');
  const fullXml = transformBoardToDrawIO(boardData, {
    includeReadOnlyFields: true,
    includeGroupZones: true,
    title: 'Product Catalog - Full',
    showFieldTypes: true,
    showDescriptions: true,
  });
  
  const fullOutputPath = path.join(outputDir, 'productCatalog-full.drawio');
  fs.writeFileSync(fullOutputPath, fullXml, 'utf-8');
  console.log(`✓ Generated: ${fullOutputPath}`);
  console.log(`  Size: ${(fullXml.length / 1024).toFixed(2)} KB\n`);

  // Test 2: Clean conversion without readonly fields
  console.log('Test 2: Clean conversion (no readonly fields)...');
  const cleanXml = transformBoardToDrawIO(boardData, {
    includeReadOnlyFields: false,
    includeGroupZones: true,
    title: 'Product Catalog - Clean',
    showFieldTypes: true,
    showDescriptions: false,
  });
  
  const cleanOutputPath = path.join(outputDir, 'productCatalog-clean.drawio');
  fs.writeFileSync(cleanOutputPath, cleanXml, 'utf-8');
  console.log(`✓ Generated: ${cleanOutputPath}`);
  console.log(`  Size: ${(cleanXml.length / 1024).toFixed(2)} KB\n`);

  // Test 3: Simple conversion without types
  console.log('Test 3: Simple conversion (no types, no descriptions)...');
  const simpleXml = transformBoardToDrawIO(boardData, {
    includeReadOnlyFields: false,
    includeGroupZones: false,
    title: 'Product Catalog - Simple',
    showFieldTypes: false,
    showDescriptions: false,
  });
  
  const simpleOutputPath = path.join(outputDir, 'productCatalog-simple.drawio');
  fs.writeFileSync(simpleOutputPath, simpleXml, 'utf-8');
  console.log(`✓ Generated: ${simpleOutputPath}`);
  console.log(`  Size: ${(simpleXml.length / 1024).toFixed(2)} KB\n`);

  console.log('✅ All tests completed successfully!');
  console.log('\nYou can open the generated .drawio files with:');
  console.log('  - draw.io desktop app');
  console.log('  - https://app.diagrams.net');
  console.log('  - VS Code with Draw.io Integration extension');

} catch (error) {
  console.error('❌ Error during testing:', error.message);
  console.error(error.stack);
  process.exit(1);
}
