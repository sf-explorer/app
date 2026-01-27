#!/usr/bin/env node

/**
 * Test edge style support
 * Validates that edge styles are properly applied in the Draw.io output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { transformBoardToDrawIO } from '../dist/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing edge style support...\n');

// Create a test board with various edge styles
const testBoard = {
  nodes: [
    {
      id: 'node1',
      type: 'table',
      position: { x: 0, y: 0 },
      data: {
        label: 'Table1',
        schema: {
          properties: {
            Id: { type: 'string', title: 'ID' },
            Name: { type: 'string', title: 'Name' }
          }
        }
      }
    },
    {
      id: 'node2',
      type: 'table',
      position: { x: 300, y: 0 },
      data: {
        label: 'Table2',
        schema: {
          properties: {
            Id: { type: 'string', title: 'ID' },
            Name: { type: 'string', title: 'Name' }
          }
        }
      }
    },
    {
      id: 'node3',
      type: 'table',
      position: { x: 600, y: 0 },
      data: {
        label: 'Table3',
        schema: {
          properties: {
            Id: { type: 'string', title: 'ID' }
          }
        }
      }
    }
  ],
  edges: [
    {
      id: 'edge1',
      source: 'node1',
      target: 'node2',
      label: 'has many',
      style: {
        strokeWidth: 3,
        strokeColor: '#ff0000',
        fontSize: 14
      }
    },
    {
      id: 'edge2',
      source: 'node2',
      target: 'node3',
      label: 'dashed',
      style: {
        strokeDasharray: '5,5',
        strokeColor: '#0066cc',
        opacity: 0.7
      }
    },
    {
      id: 'edge3',
      source: 'node1',
      target: 'node3',
      label: 'curved',
      style: {
        curved: true,
        strokeColor: '#00aa00',
        strokeWidth: 2
      }
    },
    {
      id: 'edge4',
      source: 'node2',
      target: 'node3',
      label: 'default style'
      // No style property - should use defaults
    }
  ]
};

let testsPassed = 0;
let testsFailed = 0;

function test(description, condition, xml) {
  if (condition) {
    console.log(`✅ ${description}`);
    testsPassed++;
  } else {
    console.log(`❌ ${description}`);
    testsFailed++;
    if (xml) {
      // Show a snippet of the XML for debugging
      const snippet = xml.substring(0, 200);
      console.log(`   XML snippet: ${snippet}...`);
    }
  }
}

try {
  // Test ERD style
  console.log('Testing ERD style edge properties...\n');
  const erdXml = transformBoardToDrawIO(testBoard, { diagramStyle: 'erd' });

  // Test strokeWidth
  test('strokeWidth is applied', erdXml.includes('strokeWidth=3'), erdXml);
  
  // Test strokeColor
  test('strokeColor is applied', erdXml.includes('strokeColor=#ff0000'), erdXml);
  test('strokeColor (edge2) is applied', erdXml.includes('strokeColor=#0066cc'), erdXml);
  
  // Test strokeDasharray -> dashPattern
  test('strokeDasharray converts to dashPattern', erdXml.includes('dashPattern=5,5'), erdXml);
  
  // Test curved
  test('curved edge style is applied', erdXml.includes('edgeStyle=curvedEdgeStyle'), erdXml);
  test('curved property is set', erdXml.includes('curved=1'), erdXml);
  
  // Test fontSize
  test('fontSize is applied', erdXml.includes('fontSize=14'), erdXml);
  
  // Test opacity
  test('opacity is converted correctly', erdXml.includes('opacity=70'), erdXml);
  
  // Test edge labels
  test('edge label "has many" is present', erdXml.includes('has many'), erdXml);
  test('edge label "dashed" is present', erdXml.includes('dashed'), erdXml);
  test('edge label "curved" is present', erdXml.includes('curved'), erdXml);

  // Test default values
  test('default strokeWidth is applied when not specified', erdXml.includes('strokeWidth=2'), erdXml);
  test('default strokeColor is applied when not specified', erdXml.includes('strokeColor=#6c757d'), erdXml);

  console.log('\n---\n');

  // Test UML style
  console.log('Testing UML style edge properties...\n');
  const umlXml = transformBoardToDrawIO(testBoard, { diagramStyle: 'uml' });

  test('UML: strokeWidth is applied', umlXml.includes('strokeWidth=3'), umlXml);
  test('UML: strokeColor is applied', umlXml.includes('strokeColor=#ff0000'), umlXml);
  test('UML: default fontSize is 11', umlXml.includes('fontSize=11'), umlXml);
  test('UML: edge labels are present', umlXml.includes('has many'), umlXml);

  // Save test output for manual inspection
  const outputDir = path.join(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const erdOutputPath = path.join(outputDir, 'test-edge-styles-erd.drawio');
  const umlOutputPath = path.join(outputDir, 'test-edge-styles-uml.drawio');
  
  fs.writeFileSync(erdOutputPath, erdXml, 'utf-8');
  fs.writeFileSync(umlOutputPath, umlXml, 'utf-8');

  console.log('\n---\n');
  console.log(`📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
  console.log(`\n📁 Test outputs saved:`);
  console.log(`   - ${erdOutputPath}`);
  console.log(`   - ${umlOutputPath}`);
  console.log(`\n💡 Open these files in https://app.diagrams.net/ to visually verify edge styles!`);

  if (testsFailed > 0) {
    console.error(`\n❌ ${testsFailed} test(s) failed!`);
    process.exit(1);
  } else {
    console.log(`\n✅ All tests passed!`);
  }

} catch (error) {
  console.error('❌ Error during testing:', error.message);
  console.error(error.stack);
  process.exit(1);
}

