/**
 * Verify that the built package can be imported and used
 */

const { transformBoardToDrawDB } = require('./dist/index.js');

console.log('✓ Package can be imported');

// Test with minimal data
const testBoard = {
  nodes: [
    {
      id: 'test1',
      type: 'table',
      position: { x: 0, y: 0 },
      data: {
        label: 'Test',
        table: { name: 'Test', label: 'Test', columns: [] },
        schema: {
          type: 'object',
          properties: {
            Id: { type: 'string', title: 'ID' }
          }
        }
      }
    }
  ],
  edges: []
};

const result = transformBoardToDrawDB(testBoard);

console.log('✓ Function executes successfully');
console.log(`✓ Produced ${result.tables.length} table(s)`);
console.log(`✓ Database type: ${result.database}`);

console.log('\n✅ Build verification passed!');

