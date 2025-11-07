# Release Notes - v2.1.0

**Release Date:** November 6, 2025  
**Type:** Minor Release (New Features)

## 🎉 What's New

### 1. Edge Tooltips 🏷️
Relationship arrows now display informative tooltips when you hover over them:
- **Relationship type** (Many-to-One, Composition, Association)
- **Source and target tables** (e.g., "InvoiceLine → Invoice")
- **Specific field connections** (e.g., "From: InvoiceLine.InvoiceId", "To: Invoice.Id")
- **Edge labels** (if present)

**Why it matters:** Makes complex diagrams much easier to understand. No more tracing arrows manually!

### 2. Enum Type Detection 🎯
Fields with enum constraints now display as `Enum` type instead of generic `Text`:
- Automatically detects JSON Schema `enum` property
- Provides more semantic information
- Examples: Status, Type, Category fields with predefined options

**Before:** `Status : Text`  
**After:** `Status : Enum`

## 🔄 Changes & Improvements

### 3. Automatic Field Grouping
Tables now organize fields logically:
1. **Primary Key (Id)** - Colored background + Bold
2. **Reference Fields (FKs)** - White background, grouped together
3. **Regular Fields** - White background

**Why it matters:** Relationships are immediately visible at the top of each table. Much more scannable!

### 4. Reference Fields Always Preserved
Fields with `x-target` property are never skipped, even with `includeReadOnlyFields: false`:
- Ensures relationship integrity
- Foreign keys are structural elements and must be visible
- Diagrams always show complete relationship picture

### 5. Simplified Field Styling
**New approach:** Only the primary key has a colored background
- **Primary Key:** Colored + Bold (stands out)
- **Foreign Keys:** White + "FK:" prefix (clean)
- **Regular Fields:** White (clean)

**Why it matters:** Less visual noise. The "FK:" prefix is sufficient - no need for extra coloring.

### 6. White Field Backgrounds
Changed from transparent to solid white:
- Better appearance for overlapping tables
- More professional look
- Improved readability
- Cleaner overall aesthetic

### 7. Selective Shadows
Shadows only on shapes, not on text or lines:
- ✅ **Tables, groups, boxes** - Have shadows (3D depth)
- 🚫 **Field rows** - No shadows (crisp text)
- 🚫 **Relationship arrows** - No shadows (clean lines)

**Why it matters:** Better visual hierarchy and readability. No double-shadow artifacts.

### 8. Top-to-Bottom Rendering
Elements now sorted by Y position before rendering:
- Natural overlap behavior
- Proper z-ordering
- Elements lower on canvas appear on top

**Why it matters:** Overlapping tables look intentional and clean, not random.

### 9. Edge StrokeWidth Support
Edges now respect `strokeWidth` from board data:
- Can emphasize important relationships with thicker arrows
- Falls back to default if not specified
- Read from `edge.style.strokeWidth`

## 📊 Statistics

- **All tests passing** ✅
- **Zero breaking changes**
- **Backwards compatible** with 2.0.x
- **17 boards regenerated** successfully

## 🎨 Visual Improvements Summary

| Aspect | Before | After |
|--------|--------|-------|
| Field Background | Transparent | White |
| FK Coloring | Colored background | White (only PK colored) |
| Edge Tooltips | None | Full relationship info |
| Field Grouping | Alphabetical | PK → FK → Regular |
| Shadows | Everything | Only shapes |
| Enum Fields | "Text" | "Enum" |
| Z-ordering | Random | Top-to-bottom |
| Edge Width | Fixed | Configurable |

## 📦 Installation

```bash
npm install @sf-explorer/board-to-drawio@2.1.0
```

## 🔧 Migration

No breaking changes! Simply upgrade from 2.0.x:
```bash
npm update @sf-explorer/board-to-drawio
```

All existing code will continue to work. The new features are automatic enhancements.

## 🙏 Acknowledgments

Thanks for all the feedback that drove these improvements:
- Edge tooltips for better navigation
- Cleaner styling for professional diagrams
- Smarter field organization for better readability

---

**Full Changelog:** [CHANGELOG.md](../CHANGELOG.md)  
**Documentation:** [README.md](../README.md)

