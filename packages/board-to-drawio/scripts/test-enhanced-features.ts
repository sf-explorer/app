/**
 * Test script to verify enhanced draw.io generation features:
 * - Metadata (author, description, version, repository)
 * - Page settings
 * - Viewport and zoom
 * - Title display
 * - Repository link element
 */

import { transformBoardToDrawIO } from '../src/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sample board data for testing
const testBoard = {
  nodes: [
    {
      id: 'Account',
      type: 'table',
      position: { x: 100, y: 100 },
      data: {
        label: 'Account',
        color: '#3b82f6',
        schema: {
          properties: {
            Id: { type: 'string', title: 'Account ID', description: 'Unique identifier' },
            Name: { type: 'string', title: 'Account Name', description: 'Account name' },
            Industry: { type: 'string', title: 'Industry' },
          },
        },
      },
    },
    {
      id: 'Contact',
      type: 'table',
      position: { x: 400, y: 100 },
      data: {
        label: 'Contact',
        color: '#10b981',
        schema: {
          properties: {
            Id: { type: 'string', title: 'Contact ID' },
            Name: { type: 'string', title: 'Contact Name' },
            AccountId: { type: 'string', title: 'Account ID', 'x-target': 'Account' },
          },
        },
      },
    },
  ],
  edges: [
    {
      id: 'edge1',
      source: 'Contact',
      target: 'Account',
      sourceHandle: 'AccountId-source',
      targetHandle: 'Id-target',
      label: 'belongs to',
    },
  ],
};

const outputDir = path.join(__dirname, '../output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('🧪 Testing Enhanced Draw.io Features\n');
console.log('='.repeat(60));

// Test 1: Metadata with SF Explorer author and repository
console.log('\n1️⃣ Testing metadata with SF Explorer author and repository link...');
try {
  const xml1 = transformBoardToDrawIO(testBoard, {
    title: 'Test: Metadata',
    metadata: {
      author: 'SF Explorer',
      description: 'Test diagram with metadata',
      version: '2.2.0',
      repository: 'https://github.com/sf-explorer/app',
      created: new Date(),
    },
  });
  
  // Verify metadata is present
  const hasAuthor = xml1.includes('author="SF Explorer"');
  const hasRepo = xml1.includes('repository="https://github.com/sf-explorer/app"');
  const hasVersion = xml1.includes('version="2.2.0"');
  const hasRepoLink = xml1.includes('github.com/sf-explorer/app'); // Repository link element
  
  if (hasAuthor && hasRepo && hasVersion && hasRepoLink) {
    console.log('✅ PASS: All metadata present including repository link');
    fs.writeFileSync(path.join(outputDir, 'test-metadata.drawio'), xml1, 'utf-8');
    console.log('   📄 Saved: output/test-metadata.drawio');
  } else {
    console.log('❌ FAIL: Missing metadata');
    console.log(`   Author: ${hasAuthor}, Repo: ${hasRepo}, Version: ${hasVersion}, Link: ${hasRepoLink}`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
}

// Test 2: Page settings
console.log('\n2️⃣ Testing page settings (Letter landscape)...');
try {
  const xml2 = transformBoardToDrawIO(testBoard, {
    title: 'Test: Page Settings',
    pageSettings: {
      size: 'Letter',
      orientation: 'landscape',
    },
    metadata: {
      author: 'SF Explorer',
      repository: 'https://github.com/sf-explorer/app',
    },
  });
  
  // Verify page dimensions (Letter landscape: 1056 x 816)
  const hasLetterWidth = xml2.includes('pageWidth="1056"');
  const hasLetterHeight = xml2.includes('pageHeight="816"');
  
  if (hasLetterWidth && hasLetterHeight) {
    console.log('✅ PASS: Page settings applied correctly');
    fs.writeFileSync(path.join(outputDir, 'test-page-settings.drawio'), xml2, 'utf-8');
    console.log('   📄 Saved: output/test-page-settings.drawio');
  } else {
    console.log('❌ FAIL: Page settings not applied');
    console.log(`   Width: ${hasLetterWidth}, Height: ${hasLetterHeight}`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
}

// Test 3: Viewport auto-fit
console.log('\n3️⃣ Testing viewport auto-fit...');
try {
  const xml3 = transformBoardToDrawIO(testBoard, {
    title: 'Test: Viewport',
    viewport: {
      autoFit: true,
      initialZoom: 0.75,
      centerContent: true,
    },
    metadata: {
      author: 'SF Explorer',
      repository: 'https://github.com/sf-explorer/app',
    },
  });
  
  // Verify pageScale (zoom) is set
  const hasZoom = xml3.includes('pageScale="0.75"');
  const hasViewport = xml3.includes('dx=') && xml3.includes('dy=');
  
  if (hasZoom && hasViewport) {
    console.log('✅ PASS: Viewport settings applied');
    fs.writeFileSync(path.join(outputDir, 'test-viewport.drawio'), xml3, 'utf-8');
    console.log('   📄 Saved: output/test-viewport.drawio');
  } else {
    console.log('❌ FAIL: Viewport settings not applied');
    console.log(`   Zoom: ${hasZoom}, Viewport: ${hasViewport}`);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
}

// Test 4: Title display
console.log('\n4️⃣ Testing visible title display...');
try {
  const xml4 = transformBoardToDrawIO(testBoard, {
    title: 'Test: Visible Title',
    titleDisplay: {
      show: true,
      position: 'top-center',
      fontSize: 24,
      fontStyle: 'bold',
      color: '#1a73e8',
    },
    metadata: {
      author: 'SF Explorer',
      repository: 'https://github.com/sf-explorer/app',
    },
  });
  
  // Verify title element exists
  const hasTitle = xml4.includes('Test: Visible Title') && xml4.includes('id="title_');
  
  if (hasTitle) {
    console.log('✅ PASS: Title display working');
    fs.writeFileSync(path.join(outputDir, 'test-title-display.drawio'), xml4, 'utf-8');
    console.log('   📄 Saved: output/test-title-display.drawio');
  } else {
    console.log('❌ FAIL: Title not displayed');
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
}

// Test 5: Complete example with all features
console.log('\n5️⃣ Testing complete example with all features...');
try {
  const xml5 = transformBoardToDrawIO(testBoard, {
    title: 'Complete Test - All Features',
    diagramStyle: 'erd',
    
    metadata: {
      author: 'SF Explorer',
      description: 'Complete test with all enhanced features',
      version: '2.2.0',
      repository: 'https://github.com/sf-explorer/app',
      created: new Date(),
      testProperty: 'test-value',
    },
    
    pageSettings: {
      size: 'A4',
      orientation: 'portrait',
    },
    
    viewport: {
      autoFit: true,
      initialZoom: 0.8,
      centerContent: true,
    },
    
    titleDisplay: {
      show: true,
      position: 'top-center',
      fontSize: 24,
      fontStyle: 'bold',
      color: '#000000',
    },
  });
  
  // Verify all features
  const checks = {
    author: xml5.includes('author="SF Explorer"'),
    repository: xml5.includes('repository="https://github.com/sf-explorer/app"'),
    repoLink: xml5.includes('github.com/sf-explorer/app') && xml5.includes('<a href'),
    version: xml5.includes('version="2.2.0"'),
    pageScale: xml5.includes('pageScale="0.8"'),
    title: xml5.includes('Complete Test - All Features') && xml5.includes('id="title_'),
    customProperty: xml5.includes('testProperty="test-value"'),
  };
  
  const allPassed = Object.values(checks).every(v => v === true);
  
  if (allPassed) {
    console.log('✅ PASS: All features working correctly');
    fs.writeFileSync(path.join(outputDir, 'test-all-features.drawio'), xml5, 'utf-8');
    console.log('   📄 Saved: output/test-all-features.drawio');
  } else {
    console.log('❌ FAIL: Some features missing');
    console.log('   Checks:', checks);
  }
} catch (error) {
  console.log(`❌ FAIL: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Test suite completed!');
console.log('📂 Test outputs saved to: output/');
console.log('💡 Open the .drawio files in draw.io to verify visually');
