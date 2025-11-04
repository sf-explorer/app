# Browser Support for Board to Draw.io

The `board-to-drawio` package now supports both **Node.js** and **Browser** environments! 🎉

## Quick Start

### Option 1: Use the Demo Page (Easiest)

1. Build the browser bundle:
```bash
npm run build:browser
```

2. Open `demo.html` in your browser (or run `npm run demo` to build and open)

3. Drag & drop your board JSON file or click to browse

4. Click "Convert to Draw.io" and download your diagram!

### Option 2: Use via Script Tag

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Converter</title>
</head>
<body>
    <input type="file" id="fileInput" accept=".json">
    <button id="convertBtn">Convert</button>
    
    <script src="path/to/board-to-drawio.js"></script>
    <script>
        document.getElementById('convertBtn').addEventListener('click', () => {
            const file = document.getElementById('fileInput').files[0];
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const boardData = JSON.parse(e.target.result);
                
                // Convert to draw.io XML
                const xml = BoardToDrawIO.transformBoardToDrawIO(boardData, {
                    showFieldTypes: true,
                    includeReadOnlyFields: false
                });
                
                // Download the file
                const blob = new Blob([xml], { type: 'application/xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'diagram.drawio';
                a.click();
            };
            
            reader.readAsText(file);
        });
    </script>
</body>
</html>
```

### Option 3: Use as ES Module (Modern Browsers)

```html
<script type="module">
    import BoardToDrawIO from './browser/board-to-drawio.js';
    
    const xml = BoardToDrawIO.transformBoardToDrawIO(boardData, options);
</script>
```

## Building for Browser

### Development Build
```bash
npm run build:browser
```

This creates `browser/board-to-drawio.js` (~8KB minified)

### What Gets Bundled?

- ✅ Core transformation logic
- ✅ All type definitions
- ✅ UMD wrapper (works everywhere)
- ❌ Node.js `fs` module (not needed in browser)
- ❌ Examples/tests (separate files)

## Browser API

### Global Variable: `BoardToDrawIO`

When loaded via script tag, the library exposes a global `BoardToDrawIO` object:

```javascript
// Main function
BoardToDrawIO.transformBoardToDrawIO(board, options)

// Shorthand
BoardToDrawIO.transform(board, options)
```

### Options (Same as Node.js)

```typescript
{
  showFieldTypes?: boolean;           // Show field types (default: true)
  includeReadOnlyFields?: boolean;    // Include readonly fields (default: false)
  includeGroupZones?: boolean;        // Include group zones (default: true)
  showDescriptions?: boolean;         // Show descriptions (default: false)
  title?: string;                     // Diagram title
  tableWidth?: number;                // Table width (default: 220)
  fieldHeight?: number;               // Field height (default: 28)
}
```

## Demo Features

The included `demo.html` provides:

- 📁 **Drag & Drop** file upload
- ⚙️ **Live Options** toggle (field types, descriptions, etc.)
- 📊 **Statistics** display (tables, relationships, file size)
- 💾 **Instant Download** of `.drawio` files
- 🎨 **Beautiful UI** with gradients and animations

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |
| IE 11   | -       | ❌ Not Supported |

## File Size

- **Minified**: ~8KB
- **Gzipped**: ~3KB

## CDN Usage (Future)

Once published, you can use via CDN:

```html
<!-- unpkg -->
<script src="https://unpkg.com/@sf-explorer/board-to-drawio/browser/board-to-drawio.js"></script>

<!-- jsdelivr -->
<script src="https://cdn.jsdelivr.net/npm/@sf-explorer/board-to-drawio/browser/board-to-drawio.js"></script>
```

## TypeScript Support

The browser build includes TypeScript definitions:

```typescript
import BoardToDrawIO from '@sf-explorer/board-to-drawio';
import type { BoardTemplate, ConversionOptions } from '@sf-explorer/board-to-drawio';

const board: BoardTemplate = { /* ... */ };
const options: ConversionOptions = { /* ... */ };
const xml = BoardToDrawIO.transformBoardToDrawIO(board, options);
```

## Troubleshooting

### Script Not Loading?

Make sure the path is correct:
```html
<!-- If demo.html is in the package root -->
<script src="./browser/board-to-drawio.js"></script>

<!-- If your HTML is elsewhere -->
<script src="../path/to/browser/board-to-drawio.js"></script>
```

### `BoardToDrawIO is not defined`?

The script tag must be placed **before** your code:
```html
<!-- ✅ Correct order -->
<script src="./browser/board-to-drawio.js"></script>
<script>
    BoardToDrawIO.transform(board);
</script>

<!-- ❌ Wrong order -->
<script>
    BoardToDrawIO.transform(board); // Error!
</script>
<script src="./browser/board-to-drawio.js"></script>
```

### CORS Errors?

If loading from `file://`, some browsers block module imports. Use a local server:

```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server

# Then open http://localhost:8000/demo.html
```

## Examples

Check out the included `demo.html` for a full-featured example with:
- File upload (drag & drop)
- Options configuration
- Error handling
- Download functionality
- Beautiful UI

Happy diagramming! 📊✨



