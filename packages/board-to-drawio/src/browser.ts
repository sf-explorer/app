/**
 * Browser entry point for board-to-drawio
 * Exports the main function for use in browsers
 */

import { transformBoardToDrawIO, BoardTemplate, ConversionOptions } from './index';

// Export for browser usage
export default {
  transform: transformBoardToDrawIO,
  transformBoardToDrawIO
};

// Also export types for TypeScript users
export type { BoardTemplate, ConversionOptions };



