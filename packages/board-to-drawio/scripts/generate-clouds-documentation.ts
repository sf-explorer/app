import { transformBoardToDrawIO, type BoardTemplate } from '../dist/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


/**
 * Escapes XML special characters
 */
function escapeXml(text: string | number | Date): string {
  if (typeof text !== 'string') {
    return String(text);
  }
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface BoardData {
  nodes?: BoardTemplate['nodes'];
  edges?: BoardTemplate['edges'];
}

interface ProcessedBoard {
  nodes: BoardTemplate['nodes'];
  edges: BoardTemplate['edges'];
}

/**
 * Main function to generate consolidated multi-cloud draw.io documentation
 */
function main(): void {
  const boardsDir = path.join(__dirname, '../../salesforce-data-models/data');
  const outputDir = path.join(__dirname, '../output');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get list of existing board files to avoid conflicts
  const existingBoardFiles = new Set<string>();
  if (fs.existsSync(outputDir)) {
    const existingFiles = fs.readdirSync(outputDir)
      .filter(file => file.endsWith('.drawio') && !file.includes('-clouds') && file !== 'all-clouds.drawio')
      .map(file => path.basename(file, '.drawio').toLowerCase());
    existingFiles.forEach(file => existingBoardFiles.add(file));
  }

  // Get all JSON board files (exclude boardTemplates.ts and component.json)
  const boardFiles = fs.readdirSync(boardsDir)
    .filter(file => file.endsWith('.json') && file !== 'component.json')
    .sort();

  console.log(`\nGenerating consolidated multi-cloud draw.io documentation...\n`);

  // Collect all boards - one page per board file
  const allBoards = new Map<string, ProcessedBoard>();
  const processedBoards: string[] = [];

  for (const boardFile of boardFiles) {
    try {
      const boardPath = path.join(boardsDir, boardFile);
      const boardContent = fs.readFileSync(boardPath, 'utf-8');
      const board: BoardData = JSON.parse(boardContent);
      
      // Skip if not a valid board template
      if (!board.nodes || !board.edges) {
        console.log(`⊘ ${boardFile} (not a board template, skipping)`);
        continue;
      }
      
      const boardName = path.basename(boardFile, '.json');
      
      // Store the entire board - one page per board file
      allBoards.set(boardName, {
        nodes: board.nodes,
        edges: board.edges
      });
      
      processedBoards.push(boardName);
      console.log(`✓ ${boardName.padEnd(25)} processed (${board.nodes.length} nodes, ${board.edges.length} edges)`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`✗ ${boardFile.padEnd(25)} → Error: ${errorMessage}`);
    }
  }

  // Build consolidated multi-page XML
  const xmlParts: string[] = [];
  const metadata = {
    author: 'SF Explorer',
    description: `Complete Salesforce data model organized by cloud (${processedBoards.length} boards)`,
    version: '2.2.0',
    repository: 'https://github.com/sf-explorer/app',
    created: new Date(),
  };

  // Build metadata attributes for mxfile
  const metadataAttrs: string[] = [];
  const createdDate = metadata.created instanceof Date ? metadata.created.toISOString() : String(metadata.created);

  if (metadata.author) {
    metadataAttrs.push(`author="${escapeXml(metadata.author)}"`);
  }

  if (metadata.description) {
    metadataAttrs.push(`description="${escapeXml(metadata.description)}"`);
  }

  if (metadata.version) {
    metadataAttrs.push(`diagramVersion="${escapeXml(metadata.version)}"`);
  }

  if (metadata.repository) {
    metadataAttrs.push(`repository="${escapeXml(metadata.repository)}"`);
  }

  // Build mxfile opening tag with metadata
  let mxfileTag = '<mxfile host="app.diagrams.net" modified="' + createdDate + '" agent="SF Explorer Board Converter" version="1.0.0" type="device"';
  if (metadataAttrs.length > 0) {
    mxfileTag += ' ' + metadataAttrs.join(' ');
  }
  mxfileTag += '>';

  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push(mxfileTag);

  // Create one page per board file
  let pageIndex = 1;
  const sortedBoards = Array.from(allBoards.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  console.log(`\nGenerating ${sortedBoards.length} board pages...\n`);

  // Generate individual board files and collect content for combined file
  const boardFilesGenerated: string[] = [];

  for (const [boardName, boardData] of sortedBoards) {
    // Skip empty boards
    if (boardData.nodes.length === 0) {
      continue;
    }
    
    // Create a board template for this board
    const boardTemplate = {
      nodes: boardData.nodes,
      edges: boardData.edges
    };
    
    // Generate XML for this board
    const boardOptions = {
      collapseTables: true,
      title: boardName,
      metadata: {
        author: metadata.author,
        description: `Salesforce data model: ${boardName}`,
        version: metadata.version,
        repository: metadata.repository,
        created: metadata.created,
      },
    };
    
    // Generate individual board file (only if it doesn't already exist)
    const safeBoardName = boardName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeBoardNameLower = safeBoardName.toLowerCase();
    
    // Check if a board file already exists
    const boardFileExists = existingBoardFiles.has(safeBoardNameLower);
    
    if (!boardFileExists) {
      const boardXml = transformBoardToDrawIO(boardTemplate, boardOptions);
      const individualOutputPath = path.join(outputDir, `${safeBoardName}.drawio`);
      fs.writeFileSync(individualOutputPath, boardXml, 'utf-8');
      boardFilesGenerated.push(safeBoardName);
      console.log(`  ✓ ${boardName.padEnd(30)} → ${safeBoardName}.drawio (${boardData.nodes.length} nodes, ${boardData.edges.length} edges)`);
    } else {
      console.log(`  ⊘ ${boardName.padEnd(30)} → skipped (file already exists)`);
    }
    
    // Extract the diagram content for combined file (always include in combined file)
    const boardXml = transformBoardToDrawIO(boardTemplate, boardOptions);
    const diagramMatch = boardXml.match(/<diagram[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/diagram>/);
    if (diagramMatch) {
      const diagramId = `diagram${pageIndex}`;
      const diagramContent = diagramMatch[2];
      
      // The content already has proper indentation from buildDrawioXML
      // We just need to adjust it for the multi-page context (add 2 spaces)
      const indentedContent = diagramContent.split('\n')
        .map(line => line ? '    ' + line : line)
        .join('\n');
      
      xmlParts.push(`  <diagram id="${diagramId}" name="${escapeXml(boardName)}">`);
      xmlParts.push(indentedContent);
      xmlParts.push('  </diagram>');
      
      pageIndex++;
    }
  }

  xmlParts.push('</mxfile>');

  // Write consolidated file
  const combinedOutputPath = path.join(outputDir, 'all-clouds.drawio');
  fs.writeFileSync(combinedOutputPath, xmlParts.join('\n'), 'utf-8');

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Board documentation generated successfully`);
  console.log(`📄 Combined file: all-clouds.drawio (${sortedBoards.length} board pages)`);
  console.log(`📄 Individual files: ${boardFilesGenerated.length} new board files`);
  console.log(`📦 ${processedBoards.length} boards processed`);
  console.log(`📂 Output directory: ${outputDir}`);
  console.log('='.repeat(60));
}

// Run the script
main();
