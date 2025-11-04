#!/usr/bin/env node

/**
 * Test viewer URL generation with a real board
 */

const fs = require('fs');
const path = require('path');
const { transformBoardWithViewerUrl } = require('./dist/index');

console.log('\n🧪 Testing viewer URL generation...\n');

try {
  // Load a real board
  const boardPath = path.join(__dirname, '../../Boards/datacloud.json');
  const boardData = JSON.parse(fs.readFileSync(boardPath, 'utf-8'));

  const { viewerUrl } = transformBoardWithViewerUrl(boardData, {
    title: 'Data Cloud Test',
    showFieldTypes: true,
    includeReadOnlyFields: false
  });

  console.log('✅ Generated URL successfully!');
  console.log('\n📏 URL Length:', viewerUrl.length, 'characters');
  console.log('\n🔗 Click to open:');
  console.log(viewerUrl);
  console.log('\n💡 Copy the URL above and paste it in your browser to test!\n');

  // Verify format
  if (viewerUrl.startsWith('https://viewer.diagrams.net/') && viewerUrl.includes('#R')) {
    console.log('✅ URL format is correct (contains #R prefix)\n');
  } else {
    console.log('❌ Warning: URL format may be incorrect\n');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error.stack);
  process.exit(1);
}
