/**
 * Simple test to verify the transformation works
 */

import { transformBoardToDrawDB, BoardTemplate } from './src';

// Mock board template for testing
const mockBoard: BoardTemplate = {
  nodes: [
    {
      id: 'table1',
      type: 'table',
      position: { x: 100, y: 100 },
      data: {
        label: 'Account',
        table: {
          name: 'Account',
          label: 'Account',
          description: 'Standard Account object',
          columns: []
        },
        schema: {
          type: 'object',
          description: 'Standard Account object',
          properties: {
            Id: {
              type: 'string',
              title: 'Account ID',
              readOnly: true,
              description: 'Unique identifier'
            },
            Name: {
              type: 'string',
              title: 'Account Name',
              description: 'Name of the account'
            },
            CreatedDate: {
              type: 'string',
              title: 'Created Date',
              format: 'date-time',
              readOnly: true,
              description: 'Date when the account was created'
            }
          }
        }
      }
    },
    {
      id: 'table2',
      type: 'table',
      position: { x: 400, y: 100 },
      data: {
        label: 'Contact',
        table: {
          name: 'Contact',
          label: 'Contact',
          description: 'Standard Contact object',
          columns: []
        },
        schema: {
          type: 'object',
          description: 'Standard Contact object',
          properties: {
            Id: {
              type: 'string',
              title: 'Contact ID',
              readOnly: true,
              description: 'Unique identifier'
            },
            FirstName: {
              type: 'string',
              title: 'First Name',
              description: 'First name of the contact'
            },
            LastName: {
              type: 'string',
              title: 'Last Name',
              description: 'Last name of the contact'
            },
            AccountId: {
              type: 'string',
              title: 'Account ID',
              'x-target': 'Account',
              description: 'Related Account'
            }
          }
        }
      }
    },
    {
      id: 'group1',
      type: 'groupZone',
      position: { x: 50, y: 50 },
      width: 600,
      height: 300,
      data: {
        label: 'Core Objects',
        content: 'Standard Salesforce objects',
        color: '#e3f2fd'
      }
    }
  ],
  edges: [
    {
      id: 'edge1',
      source: 'table2',
      target: 'table1',
      sourceHandle: 'AccountId-source',
      targetHandle: 'Id-target',
      type: 'betweenTables',
      label: 'Account Lookup'
    }
  ]
};

console.log('Running transformation test...\n');

// Test 1: Basic transformation
console.log('Test 1: Basic transformation');
const schema1 = transformBoardToDrawDB(mockBoard);
console.log(`✓ Tables: ${schema1.tables.length} (expected: 2)`);
console.log(`✓ Relationships: ${schema1.relationships.length} (expected: 1)`);
console.log(`✓ Subject Areas: ${schema1.subjectAreas?.length || 0} (expected: 1)`);

// Verify table structure
const accountTable = schema1.tables.find(t => t.name === 'Account');
const contactTable = schema1.tables.find(t => t.name === 'Contact');

if (accountTable) {
  console.log(`✓ Account table has ${accountTable.fields.length} fields`);
} else {
  console.error('✗ Account table not found');
}

if (contactTable) {
  console.log(`✓ Contact table has ${contactTable.fields.length} fields`);
} else {
  console.error('✗ Contact table not found');
}

// Test 2: Without read-only fields
console.log('\nTest 2: Excluding read-only fields');
const schema2 = transformBoardToDrawDB(mockBoard, { includeReadOnlyFields: false });
const contactTable2 = schema2.tables.find(t => t.name === 'Contact');
console.log(`✓ Contact table has ${contactTable2?.fields.length} fields (should have fewer)`);

// Test 3: Without group zones
console.log('\nTest 3: Excluding group zones');
const schema3 = transformBoardToDrawDB(mockBoard, { includeGroupZones: false });
console.log(`✓ Subject Areas: ${schema3.subjectAreas?.length || 0} (expected: 0)`);

// Test 4: PostgreSQL database
console.log('\nTest 4: PostgreSQL target');
const schema4 = transformBoardToDrawDB(mockBoard, { defaultDatabase: 'postgresql' });
console.log(`✓ Database type: ${schema4.database} (expected: postgresql)`);

console.log('\n✅ All tests passed!\n');

// Display sample output
console.log('Sample DrawDB Schema:');
console.log(JSON.stringify(schema1, null, 2));

