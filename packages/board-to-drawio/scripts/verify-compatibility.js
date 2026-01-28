/**
 * Verify draw.io file compatibility
 * Checks XML structure, metadata, and link attributes
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = process.argv[2] || path.join(__dirname, '../output/billingAccounting.drawio');

if (!fs.existsSync(filePath)) {
  console.error(`❌ File not found: ${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');

console.log(`\n🔍 Verifying compatibility: ${path.basename(filePath)}\n`);
console.log('='.repeat(60));

// Check 1: XML Declaration
const hasXmlDeclaration = content.startsWith('<?xml');
console.log(`${hasXmlDeclaration ? '✅' : '❌'} XML Declaration: ${hasXmlDeclaration ? 'Present' : 'Missing'}`);

// Check 2: mxfile tag
const mxfileMatch = content.match(/<mxfile[^>]*>/);
const hasMxfile = !!mxfileMatch;
console.log(`${hasMxfile ? '✅' : '❌'} mxfile tag: ${hasMxfile ? 'Present' : 'Missing'}`);

if (hasMxfile) {
  const mxfileAttrs = mxfileMatch[0];
  
  // Check metadata attributes
  const hasAuthor = mxfileAttrs.includes('author=');
  const hasDescription = mxfileAttrs.includes('description=');
  const hasVersion = mxfileAttrs.includes('version=');
  const hasRepository = mxfileAttrs.includes('repository=');
  
  console.log(`   ${hasAuthor ? '✅' : '❌'} Author attribute: ${hasAuthor ? 'Present' : 'Missing'}`);
  console.log(`   ${hasDescription ? '✅' : '❌'} Description attribute: ${hasDescription ? 'Present' : 'Missing'}`);
  console.log(`   ${hasVersion ? '✅' : '❌'} Version attribute: ${hasVersion ? 'Present' : 'Missing'}`);
  console.log(`   ${hasRepository ? '✅' : '❌'} Repository attribute: ${hasRepository ? 'Present' : 'Missing'}`);
  
  // Extract values
  const authorMatch = mxfileAttrs.match(/author="([^"]*)"/);
  const repoMatch = mxfileAttrs.match(/repository="([^"]*)"/);
  
  if (authorMatch) {
    console.log(`   📝 Author: "${authorMatch[1]}"`);
  }
  if (repoMatch) {
    console.log(`   🔗 Repository: "${repoMatch[1]}"`);
  }
}

// Check 3: Diagram structure
const hasDiagram = content.includes('<diagram');
const hasGraphModel = content.includes('<mxGraphModel');
const hasRoot = content.includes('<root>');
console.log(`\n${hasDiagram ? '✅' : '❌'} Diagram structure:`);
console.log(`   ${hasDiagram ? '✅' : '❌'} <diagram> tag`);
console.log(`   ${hasGraphModel ? '✅' : '❌'} <mxGraphModel> tag`);
console.log(`   ${hasRoot ? '✅' : '❌'} <root> tag`);

// Check 4: Repository link cell
const hasRepoLink = content.includes('link="https://github.com/sf-explorer/app"');
const repoLinkCell = content.match(/<mxCell[^>]*link="https:\/\/github\.com\/sf-explorer\/app"[^>]*>/);
console.log(`\n${hasRepoLink ? '✅' : '❌'} Repository link cell: ${hasRepoLink ? 'Present' : 'Missing'}`);

if (repoLinkCell) {
  const cellAttrs = repoLinkCell[0];
  const hasLinkAttr = cellAttrs.includes('link=');
  const hasVertex = cellAttrs.includes('vertex="1"');
  const hasParent = cellAttrs.includes('parent=');
  const hasValue = cellAttrs.includes('value=');
  
  console.log(`   ${hasLinkAttr ? '✅' : '❌'} link attribute`);
  console.log(`   ${hasVertex ? '✅' : '❌'} vertex="1"`);
  console.log(`   ${hasParent ? '✅' : '❌'} parent attribute`);
  console.log(`   ${hasValue ? '✅' : '❌'} value attribute`);
  
  // Extract link value
  const linkMatch = cellAttrs.match(/link="([^"]*)"/);
  const valueMatch = cellAttrs.match(/value="([^"]*)"/);
  if (linkMatch) {
    console.log(`   🔗 Link URL: "${linkMatch[1]}"`);
  }
  if (valueMatch) {
    console.log(`   📝 Display text: "${valueMatch[1]}"`);
  }
}

// Check 5: XML Well-formedness (basic check)
const openTags = (content.match(/</g) || []).length;
const closeTags = (content.match(/>/g) || []).length;
const hasClosingTags = content.includes('</mxfile>') && content.includes('</diagram>') && content.includes('</mxGraphModel>');
console.log(`\n${hasClosingTags ? '✅' : '❌'} XML Structure:`);
console.log(`   ${hasClosingTags ? '✅' : '❌'} Proper closing tags`);
console.log(`   📊 Tag count: ${openTags} opening, ${closeTags} closing`);

// Check 6: Draw.io compatibility indicators
const hasSwimlane = content.includes('swimlane');
const hasGeometry = content.includes('<mxGeometry');
const hasUserObject = content.includes('<UserObject');
console.log(`\n${hasSwimlane && hasGeometry ? '✅' : '❌'} Draw.io features:`);
console.log(`   ${hasSwimlane ? '✅' : '❌'} Swimlane cells`);
console.log(`   ${hasGeometry ? '✅' : '❌'} Geometry elements`);
console.log(`   ${hasUserObject ? '✅' : '❌'} UserObject elements`);

// Summary
console.log('\n' + '='.repeat(60));
const allChecks = [
  hasXmlDeclaration,
  hasMxfile,
  hasDiagram,
  hasGraphModel,
  hasRoot,
  hasRepoLink,
  hasClosingTags,
];

const passed = allChecks.filter(Boolean).length;
const total = allChecks.length;

if (passed === total) {
  console.log(`✅ Compatibility Check: PASSED (${passed}/${total})`);
  console.log('   The file is compatible with draw.io and includes all enhanced features.');
} else {
  console.log(`⚠️  Compatibility Check: PARTIAL (${passed}/${total})`);
  console.log('   Some checks failed. Review the output above.');
}

console.log('='.repeat(60) + '\n');
