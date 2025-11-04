const path = require('path');

module.exports = {
  entry: './dist/index.js',
  output: {
    path: path.resolve(__dirname, 'browser'),
    filename: 'board-to-drawio.js',
    library: {
      name: 'BoardToDrawIO',
      type: 'umd',
      export: 'default'
    },
    globalObject: 'this'
  },
  mode: 'production',
  optimization: {
    minimize: true
  }
};



