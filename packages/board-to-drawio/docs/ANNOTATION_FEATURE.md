# Annotation Badge Feature

## Overview

The annotation badge feature allows you to display metadata labels (like record counts or limits) as visual badges positioned above tables in draw.io diagrams.

## Implementation

Based on the pattern from `icon.drawio (1).xml`, tables with annotations are wrapped in a group container that includes:

1. **Group Wrapper** - A parent container that holds the badge and table together
2. **Annotation Badge** - A rounded rectangle with orange styling at the top-right
3. **Table** - The main table positioned below the badge

## Visual Structure

```
┌─────────────────────────────────┐
│                          [20k]   │  ← Badge (orange, top-right)
├─────────────────────────────────┤
│         Table Name               │  ← Table (positioned 20px below)
│  ┌──────────────────────────┐   │
│  │ PK: Id                   │   │
│  │ FK: AccountId            │   │
│  │ ...                      │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

## Usage

### In Board JSON

Add the `annotation` property to any table node:

```json
{
  "id": "Case",
  "type": "table",
  "data": {
    "label": "Case",
    "annotation": "20k",
    "icon": "standard:case",
    "color": "#00A1E0",
    "schema": { ... }
  }
}
```

### Generated Draw.io Structure

```xml
<!-- Group wrapper at original position -->
<mxCell id="group_Case_annotation" value="" style="group" 
        vertex="1" connectable="0" parent="1">
  <mxGeometry x="40" y="-50" width="200" height="640" as="geometry"/>
</mxCell>

<!-- Annotation badge (top-right) -->
<mxCell id="Case_annotation_badge" value="<b>20k</b>" 
        style="rounded=1;whiteSpace=wrap;html=1;fillColor=#ffe6cc;strokeColor=#d79b00;arcSize=9;" 
        vertex="1" parent="group_Case_annotation">
  <mxGeometry x="140" y="0" width="60" height="34" as="geometry"/>
</mxCell>

<!-- Main table (positioned below badge) -->
<UserObject label="Case" tooltip="..." id="table_Case">
  <mxCell style="swimlane;..." vertex="1" parent="group_Case_annotation">
    <mxGeometry x="0" y="20" width="200" height="606" as="geometry"/>
  </mxCell>
</UserObject>
```

## Technical Details

### Positioning
- **Group**: Placed at the original table position from the board
- **Badge**: Positioned at `x = tableWidth - badgeWidth` (top-right), `y = 0`
- **Table**: Positioned at `x = 0`, `y = 20` (20px below top for badge clearance)

### Styling
- **Badge Colors**:
  - Fill: `#ffe6cc` (light orange)
  - Stroke: `#d79b00` (dark orange)
  - Rounded corners: `arcSize=9`
- **Badge Size**: 60px width × 34px height
- **Font**: Bold text

### Group Properties
- `style="group"` - Marks as a group container
- `connectable="0"` - Prevents connections to the group itself (connections target child elements)

## Code Changes

### 1. Type Definitions (`src/types.ts`)
```typescript
export interface NodeData {
  annotation?: string; // Added
  // ... other properties
}

export interface DrawioCell {
  connectable?: '1' | '0'; // Added
  // ... other properties
}
```

### 2. Table Cell Creation (`src/index.ts`)

Both `createTableCells()` and `createUmlClassCells()` were updated to:

1. Check for `node.data.annotation`
2. Create group wrapper if annotation exists
3. Adjust table position to `y=20` (below badge)
4. Return array: `[groupCell, annotationCell, ...tableCells]`

### 3. Node ID Mapping

Updated logic to correctly map node IDs when annotations are present:
- Group is first cell in array
- Annotation badge is second
- Actual table cell is found by ID prefix (`table_` or `uml_class_`)

## Examples

### Salesforce Record Limits
```json
"annotation": "20k"    // Standard Salesforce limit
"annotation": "2M"     // Large limit
"annotation": "5k"     // Small limit
```

### Record Counts
```json
"annotation": "1.2M"   // Current count
"annotation": "500"    // Small dataset
```

### Status Labels
```json
"annotation": "Beta"
"annotation": "Core"
"annotation": "Custom"
```

## Benefits

1. **Visual Context** - Immediately see important metadata about tables
2. **Consistent Styling** - Orange badges stand out without cluttering
3. **Group Behavior** - Badge and table move together as one unit
4. **Non-Intrusive** - Only appears when `annotation` field is present
5. **Flexible Content** - Can display any short text/label

## Backward Compatibility

- Tables without `annotation` field work exactly as before (no group wrapper)
- Existing diagrams continue to render correctly
- Optional feature - only used when explicitly specified

## Testing

See `serviceCloud.json` for an example - the Case table has `"annotation": "20k"`.

Generate with:
```bash
node regenerate-all.cjs
```

Output: `output/serviceCloud.drawio` contains the annotation badge.

