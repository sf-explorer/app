/**
 * Example demonstrating enhanced draw.io generation features:
 * - Metadata (author, description, version)
 * - Page settings (size, orientation)
 * - Viewport and zoom control
 * - Visible title display
 */

import { transformBoardToDrawIO } from '../src/index.js';
import fs from 'fs';
import path from 'path';

// Sample board data
const board = {
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

// Example 1: Basic usage with metadata
console.log('Generating diagram with metadata...');
const xml1 = transformBoardToDrawIO(board, {
  title: 'Salesforce Data Model',
  metadata: {
    author: 'Jane Smith',
    description: 'Sample Salesforce org data model',
    version: '1.0.0',
    department: 'Engineering',
  },
});

fs.writeFileSync(
  path.join(__dirname, '../output/example-metadata.drawio'),
  xml1,
  'utf-8'
);
console.log('✓ Generated: output/example-metadata.drawio');

// Example 2: Page settings (Letter landscape)
console.log('Generating diagram with custom page settings...');
const xml2 = transformBoardToDrawIO(board, {
  title: 'Salesforce Data Model',
  pageSettings: {
    size: 'Letter',
    orientation: 'landscape',
  },
});

fs.writeFileSync(
  path.join(__dirname, '../output/example-page-settings.drawio'),
  xml2,
  'utf-8'
);
console.log('✓ Generated: output/example-page-settings.drawio');

// Example 3: Viewport auto-fit and zoom
console.log('Generating diagram with auto-fit viewport...');
const xml3 = transformBoardToDrawIO(board, {
  title: 'Salesforce Data Model',
  viewport: {
    autoFit: true,
    initialZoom: 0.75,
    centerContent: true,
  },
});

fs.writeFileSync(
  path.join(__dirname, '../output/example-viewport.drawio'),
  xml3,
  'utf-8'
);
console.log('✓ Generated: output/example-viewport.drawio');

// Example 4: Visible title display
console.log('Generating diagram with visible title...');
const xml4 = transformBoardToDrawIO(board, {
  title: 'Salesforce Data Model',
  titleDisplay: {
    show: true,
    position: 'top-center',
    fontSize: 28,
    fontStyle: 'bold',
    color: '#1a73e8',
  },
});

fs.writeFileSync(
  path.join(__dirname, '../output/example-title-display.drawio'),
  xml4,
  'utf-8'
);
console.log('✓ Generated: output/example-title-display.drawio');

// Example 5: All features combined
console.log('Generating diagram with all features...');
const xml5 = transformBoardToDrawIO(board, {
  title: 'Salesforce Data Model - Complete Example',
  diagramStyle: 'erd',
  
  // Metadata
  metadata: {
    author: 'John Doe',
    description: 'Complete Salesforce org data model with all enhancements',
    version: '2.0.0',
    created: new Date(),
    project: 'Salesforce Migration',
  },
  
  // Page settings
  pageSettings: {
    size: 'A4',
    orientation: 'portrait',
  },
  
  // Viewport
  viewport: {
    autoFit: true,
    initialZoom: 0.8,
    centerContent: true,
  },
  
  // Title display
  titleDisplay: {
    show: true,
    position: 'top-center',
    fontSize: 24,
    fontStyle: 'bold',
    color: '#000000',
  },
});

fs.writeFileSync(
  path.join(__dirname, '../output/example-all-features.drawio'),
  xml5,
  'utf-8'
);
console.log('✓ Generated: output/example-all-features.drawio');

console.log('\n✅ All examples generated successfully!');
console.log('Open the .drawio files in draw.io to see the enhancements.');
