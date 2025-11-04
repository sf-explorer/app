import {
  BoardTemplate,
  BoardNode,
  BoardEdge,
  ConversionOptions,
  SchemaProperty,
  DrawioCell,
  DrawioStyle
} from './types';

/**
 * Transforms a Salesforce Explorer board template into draw.io XML format
 * @param board - The board template to transform
 * @param options - Optional conversion options
 * @returns A draw.io compatible XML string
 */
export function transformBoardToDrawIO(
  board: BoardTemplate,
  options: ConversionOptions = {}
): string {
  // Validate input structure
  if (!board || !Array.isArray(board.nodes) || !Array.isArray(board.edges)) {
    throw new Error('Invalid board template: expected object with "nodes" and "edges" arrays');
  }

  const {
    includeReadOnlyFields = true,
    includeGroupZones = true,
    title = 'SF Explorer Board',
    showFieldTypes = true,
    showDescriptions = false,
    tableWidth = 200,
    fieldHeight = 26,
    maxFields = 20,
    collapseTables = true,
  } = options;

  const cells: DrawioCell[] = [];
  
  // Helper function to create safe IDs
  const safeId = (text: string) => {
    return text
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/^[0-9]/, 'id_$&')
      .substring(0, 50);
  };

  // Add root cell
  cells.push({ id: '0' });
  
  // Add default parent cell
  cells.push({ id: '1', parent: '0' });

  // Maps to track node IDs to draw.io cell IDs
  const nodeIdToCellId = new Map<string, string>();
  const fieldIdToCellId = new Map<string, string>(); // Map: nodeId.fieldName -> cellId
  const usedIds = new Set<string>(['0', '1']); // Track used IDs to avoid duplicates

  // Helper to get unique ID
  const getUniqueId = (preferredId: string) => {
    let id = safeId(preferredId);
    let counter = 1;
    while (usedIds.has(id)) {
      id = safeId(preferredId) + '_' + counter++;
    }
    usedIds.add(id);
    return id;
  };

  // First pass: Convert group zones if enabled
  if (includeGroupZones) {
    const groupNodes = board.nodes.filter(node => node.type === 'groupZone');
    
    for (const node of groupNodes) {
      const cellId = getUniqueId(`group_${node.data.label || node.id}`);
      nodeIdToCellId.set(node.id, cellId);
      
      const cell = createGroupCell(node, cellId, showDescriptions);
      cells.push(cell);
    }
  }

  // Second pass: Convert table nodes
  const tableNodes = board.nodes.filter(node => node.type === 'table');
  
  for (const node of tableNodes) {
    const parentCellId = node.parentId && nodeIdToCellId.has(node.parentId) 
      ? nodeIdToCellId.get(node.parentId)! 
      : '1';

    // Extract table name for ID
    let tableName: string;
    if (node.data.table?.name) {
      tableName = node.data.table.name;
    } else if (node.data.label) {
      tableName = node.data.label;
    } else {
      tableName = node.id.split('/').pop() || node.id.replace(/^erd\./, '');
    }

    const tableCells = createTableCells(
      node,
      tableName,
      parentCellId,
      includeReadOnlyFields,
      showFieldTypes,
      showDescriptions,
      tableWidth,
      fieldHeight,
      maxFields,
      collapseTables,
      fieldIdToCellId,
      getUniqueId
    );
    
    // Store the main table cell ID (first cell is the table itself)
    if (tableCells.length > 0) {
      nodeIdToCellId.set(node.id, tableCells[0].id);
    }
    
    cells.push(...tableCells);
  }

  // Third pass: Convert other node types (markdown, callout, annotation)
  // Skip types that don't render well: input, legend
  const skipTypes = ['input', 'legend'];
  const otherNodes = board.nodes.filter(
    node => !['table', 'groupZone', ...skipTypes].includes(node.type)
  );

  for (const node of otherNodes) {
    const cellId = getUniqueId(`${node.type}_${node.data.label || node.id}`);
    nodeIdToCellId.set(node.id, cellId);

    const cell = createGenericCell(node, cellId, showDescriptions);
    cells.push(cell);
  }

  // Fourth pass: Convert edges to connections
  for (const edge of board.edges) {
    let sourceId = nodeIdToCellId.get(edge.source);
    let targetId = nodeIdToCellId.get(edge.target);

    // Try to connect to specific fields if handles are provided
    if (edge.sourceHandle) {
      const sourceFieldName = edge.sourceHandle.replace(/-(source|target)(-inv)?$/, '');
      const sourceFieldKey = `${edge.source}.${sourceFieldName}`;
      const fieldCellId = fieldIdToCellId.get(sourceFieldKey);
      if (fieldCellId) {
        sourceId = fieldCellId;
      }
    }

    if (edge.targetHandle) {
      const targetFieldName = edge.targetHandle.replace(/-(source|target)(-inv)?$/, '');
      const targetFieldKey = `${edge.target}.${targetFieldName}`;
      const fieldCellId = fieldIdToCellId.get(targetFieldKey);
      if (fieldCellId) {
        targetId = fieldCellId;
      }
    }

    if (sourceId && targetId) {
      const edgeName = edge.label || edge.id.split('.').slice(-2).join('_to_');
      const cellId = getUniqueId(`edge_${edgeName}`);
      const cell = createEdgeCell(edge, cellId, sourceId, targetId);
      cells.push(cell);
    }
  }

  // Build the XML document
  return buildDrawioXML(cells, title);
}

/**
 * Creates a draw.io cell for a group zone
 */
function createGroupCell(
  node: BoardNode,
  cellId: string,
  showDescriptions: boolean
): DrawioCell {
  const color = rgbaToHex(node.data.color || '#e0e0e0');
  const label = escapeXml(node.data.label || 'Group');
  const content = showDescriptions && node.data.content 
    ? `\n${escapeXml(node.data.content)}` 
    : '';

  const style = buildStyle({
    swimlane: 0,
    fillColor: color,
    strokeColor: darkenColor(color, 20),
    strokeWidth: 2,
    rounded: 1,
    fontSize: 14,
    fontStyle: 1,
    align: 'left',
    verticalAlign: 'top',
    spacingLeft: 10,
    spacingTop: 10,
  });

  return {
    id: cellId,
    value: label + content,
    style,
    vertex: '1',
    parent: '1',
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    width: node.width || 800,
    height: node.height || 400,
  };
}

/**
 * Creates draw.io cells for a table node (parent + field cells)
 */
function createTableCells(
  node: BoardNode,
  tableName: string,
  parentId: string,
  includeReadOnlyFields: boolean,
  showFieldTypes: boolean,
  showDescriptions: boolean,
  tableWidth: number,
  fieldHeight: number,
  maxFields: number,
  collapseTables: boolean,
  fieldIdToCellId: Map<string, string>,
  getUniqueId: (preferred: string) => string
): DrawioCell[] {
  const cells: DrawioCell[] = [];
  const color = rgbaToHex(node.data.color || '#3b82f6');

  // Get fields from schema
  const fields: Array<{
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
    referencedTable?: string;
    description: string;
  }> = [];

  if (node.data.schema?.properties) {
    for (const [fieldName, fieldProp] of Object.entries(node.data.schema.properties)) {
      const isPrimaryKey = fieldName === 'Id';
      const isForeignKey = fieldProp['x-target'] !== undefined || 
                          (fieldName.endsWith('Id') && fieldName !== 'Id');
      
      // Skip read-only fields if option is set (except primary keys)
      if (!includeReadOnlyFields && fieldProp.readOnly && !isPrimaryKey) {
        continue;
      }

      fields.push({
        name: fieldName,
        type: mapTypeToDisplay(fieldProp.type, fieldProp.format, isForeignKey),
        isPrimary: isPrimaryKey,
        isForeign: isForeignKey,
        referencedTable: fieldProp['x-target'],
        description: fieldProp.description || fieldProp.title || ''
      });
    }
  }

  // Limit the number of fields if maxFields is set
  const displayFields = fields.slice(0, maxFields);
  const hasMoreFields = fields.length > maxFields;

  // Create parent table cell (container with swimlane header)
  // Get icon URL if available - if there's an icon, make header taller
  const iconUrl = node.data.icon ? getSalesforceIconUrl(node.data.icon) : undefined;
  const headerHeight = iconUrl ? 60 : 30; // Much taller header when icon is present
  
  const totalFields = displayFields.length + (hasMoreFields ? 1 : 0); // +1 for "... N more fields"
  const tableHeight = headerHeight + (fieldHeight * totalFields);
  const tableCellId = getUniqueId(`table_${tableName}`);
  
  const tableStyle = buildStyle({
    swimlane: 1, // Enable swimlane with header
    fontStyle: 1, // Bold for table name
    childLayout: 'stackLayout',
    horizontal: 1,
    startSize: headerHeight,
    horizontalStack: 0,
    resizeParent: 1,
    resizeParentMax: 0,
    resizeLast: 0,
    collapsible: 1,
    marginBottom: 0,
    fillColor: color,
    strokeColor: darkenColor(color, 20),
    strokeWidth: 2,
    rounded: 0,
    align: 'center',
    verticalAlign: 'middle',
    html: 1,
    ...(iconUrl ? {
      image: iconUrl,
    } : {}),
  });

  // Build tooltip for table
  let tableTooltip = `${fields.length} field${fields.length !== 1 ? 's' : ''}`;
  if (hasMoreFields) {
    tableTooltip += ` (showing ${displayFields.length})`;
  }
  if (node.data.schema?.description) {
    tableTooltip += `\n${node.data.schema.description}`;
  }

  // When collapsed, show header height; when expanded, show full height
  const displayHeight = collapseTables ? headerHeight : tableHeight;
  const alternateHeight = collapseTables ? tableHeight : headerHeight;
  
  cells.push({
    id: tableCellId,
    value: escapeXml(tableName),
    style: tableStyle,
    vertex: '1',
    parent: parentId,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    width: tableWidth,
    height: displayHeight,
    collapsed: collapseTables ? '1' : '0',
    // Add alternate bounds for expanded/collapsed state
    alternateBounds: {
      width: tableWidth,
      height: alternateHeight,
    },
    tooltip: escapeXml(tableTooltip)
  });

  // Create field cells
  let currentY = headerHeight; // Start after the header
  for (const field of displayFields) {
    const fieldCellId = getUniqueId(`${tableName}_${field.name}`);
    
    // Store field cell ID for edge connections
    const fieldKey = `${node.id}.${field.name}`;
    fieldIdToCellId.set(fieldKey, fieldCellId);
    
    // Use clean API name without type annotations
    let fieldLabel = escapeXml(field.name);
    
    // Only add type if explicitly requested
    if (showFieldTypes) {
      // For foreign keys, show referenced table name instead of "FK"
      if (field.isForeign && field.referencedTable) {
        fieldLabel += ` : ${escapeXml(field.referencedTable)}`;
      } else {
        fieldLabel += ` : ${escapeXml(field.type)}`;
      }
    }
    
    // Only add description if explicitly requested
    if (showDescriptions && field.description) {
      fieldLabel += `\n${escapeXml(field.description.substring(0, 80))}`;
    }

    // Determine field style
    let fieldStyle: DrawioStyle = {
      text: 1,
      align: 'left',
      verticalAlign: 'middle',
      spacingLeft: 4,
      spacingRight: 4,
      overflow: 'hidden',
      rotatable: 0,
      points: '[[0,0.5],[1,0.5]]',
      portConstraint: 'eastwest',
      fillColor: lightenColor(color, 40),
      strokeColor: darkenColor(color, 10),
      fontSize: 12,
    };

    if (field.isPrimary) {
      fieldStyle = {
        ...fieldStyle,
        fontStyle: 1, // bold (simplified from bold+underline)
        fillColor: lightenColor(color, 30),
      };
      fieldLabel = 'PK: ' + fieldLabel;
    } else if (field.isForeign) {
      fieldStyle = {
        ...fieldStyle,
        fontStyle: 0, // normal
        fillColor: lightenColor(color, 35),
      };
      fieldLabel = 'FK: ' + fieldLabel;
    }

    const fieldCell: DrawioCell = {
      id: fieldCellId,
      value: fieldLabel,
      style: buildStyle(fieldStyle),
      vertex: '1',
      parent: tableCellId,
      x: 0,
      y: currentY,
      width: tableWidth,
      height: fieldHeight,
    };
    
    // Add tooltip if description exists
    if (field.description) {
      fieldCell.tooltip = escapeXml(field.description);
    }
    
    cells.push(fieldCell);
    
    // Move Y position down for next field
    currentY += fieldHeight;
  }

  // Add "... N more fields" indicator if there are hidden fields
  if (hasMoreFields) {
    const moreCellId = getUniqueId(`${tableName}_more`);
    const moreCount = fields.length - maxFields;
    const moreStyle = buildStyle({
      text: 1,
      align: 'center',
      verticalAlign: 'middle',
      spacingLeft: 4,
      spacingRight: 4,
      overflow: 'hidden',
      rotatable: 0,
      points: '[[0,0.5],[1,0.5]]',
      portConstraint: 'eastwest',
      fillColor: lightenColor(color, 45),
      strokeColor: darkenColor(color, 10),
      fontSize: 11,
      fontStyle: 2, // italic
    });

    cells.push({
      id: moreCellId,
      value: escapeXml(`... ${moreCount} more field${moreCount > 1 ? 's' : ''}`),
      style: moreStyle,
      vertex: '1',
      parent: tableCellId,
      x: 0,
      y: currentY,
      width: tableWidth,
      height: fieldHeight,
    });
  }

  return cells;
}

/**
 * Creates a draw.io cell for generic nodes (markdown, callout, annotation)
 */
function createGenericCell(
  node: BoardNode,
  cellId: string,
  showDescriptions: boolean
): DrawioCell {
  const color = rgbaToHex(node.data.color || '#f0f0f0');
  let label = escapeXml(node.data.label || '');
  
  if (showDescriptions && node.data.content) {
    label += `\n\n${escapeXml(node.data.content)}`;
  }

  // Different styles based on node type
  let style: DrawioStyle = {
    rounded: 1,
    whiteSpace: 'wrap',
    html: 1,
    fillColor: color,
    strokeColor: darkenColor(color, 20),
    fontSize: 12,
  };

  if (node.type === 'markdown') {
    style = {
      ...style,
      text: 1,
      align: 'center',
      verticalAlign: 'middle',
      fontSize: node.style?.fontSize ? parseInt(node.style.fontSize) : 14,
      fontStyle: 1,
    };
  } else if (node.type === 'callout') {
    style = {
      ...style,
      shape: 'note',
      fontSize: 11,
      align: 'left',
      verticalAlign: 'top',
    };
    
    if (node.data.method && node.data.url) {
      label = `${node.data.method} ${node.data.url}\n\n${label}`;
    }
  } else if (node.type === 'annotation' || node.type === 'note') {
    style = {
      ...style,
      shape: 'note',
      fontSize: 12,
      align: 'left',
      verticalAlign: 'top',
      fillColor: '#ffffcc',
      strokeColor: '#cccc00',
    };
  }

  return {
    id: cellId,
    value: label,
    style: buildStyle(style),
    vertex: '1',
    parent: '1',
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    width: node.width || 180,
    height: node.height || 80,
  };
}

/**
 * Creates a draw.io cell for an edge (relationship)
 */
function createEdgeCell(
  edge: BoardEdge,
  cellId: string,
  sourceId: string,
  targetId: string
): DrawioCell {
  const label = edge.label ? escapeXml(edge.label) : '';
  
  // Determine arrow style based on edge type
  // Using proper ERD notation
  let endArrow = 'ERone';
  let startArrow = 'ERmany';

  if (edge.type === 'betweenTablesInverted') {
    // For inverted edges: source has FK, target is referenced table
    // Visual: InvoiceLine (many) → Invoice (one)
    // So we want ERmany at source, ERone at target
    endArrow = 'ERone';
    startArrow = 'ERmany';
  } else if (edge.type === 'betweenTables') {
    // Standard edge: source has FK, target is referenced table
    // Visual: BillingPolicy (many) → BillingTreatment (one)
    // Same as inverted: ERmany at source, ERone at target
    endArrow = 'ERone';
    startArrow = 'ERmany';
  } else {
    // Custom edges or other types - default behavior
    endArrow = 'ERone';
    startArrow = 'ERmany';
  }

  const style = buildStyle({
    edgeStyle: 'orthogonalEdgeStyle',  // Orthogonal routing for cleaner right-angle lines
    rounded: 0,  // Sharp corners for orthogonal lines
    orthogonalLoop: 1,
    jettySize: 'auto',
    fontSize: 12,
    html: 1,
    endArrow,
    startArrow,
    endFill: 0,
    startFill: 0,
    strokeWidth: 2,
    strokeColor: '#6c757d',
    curved: 0,  // Ensure no curves on orthogonal lines
  });

  return {
    id: cellId,
    value: label,
    style,
    edge: '1',
    parent: '1',
    source: sourceId,
    target: targetId,
  };
}

/**
 * Builds a style string from a style object
 */
function buildStyle(style: DrawioStyle): string {
  return Object.entries(style)
    .map(([key, value]) => {
      // For swimlane property, omit the value if it's 1 (enabled)
      if (key === 'swimlane' && value === 1) {
        return 'swimlane';
      }
      return `${key}=${value}`;
    })
    .join(';') + ';';
}

/**
 * Converts RGBA color to hex format
 */
function rgbaToHex(color: string): string {
  if (color.startsWith('#')) {
    return color;
  }

  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }
  
  return color;
}

/**
 * Darkens a hex color by a percentage
 */
function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * Lightens a hex color by a percentage
 */
function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min((num >> 16) + amt, 255);
  const G = Math.min(((num >> 8) & 0x00FF) + amt, 255);
  const B = Math.min((num & 0x0000FF) + amt, 255);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * Maps JSON Schema types to display types
 */
function mapTypeToDisplay(type: string, format?: string, isForeign?: boolean): string {
  if (isForeign) {
    return 'FK';
  }

  if (format) {
    switch (format) {
      case 'date':
        return 'Date';
      case 'date-time':
        return 'DateTime';
      case 'email':
        return 'Email';
      case 'uri':
      case 'url':
        return 'URL';
    }
  }

  switch (type) {
    case 'string':
      return 'Text';
    case 'number':
      return 'Number';
    case 'integer':
      return 'Integer';
    case 'boolean':
      return 'Boolean';
    case 'array':
      return 'Array';
    case 'object':
      return 'Object';
    default:
      return 'Text';
  }
}

/**
 * Converts Salesforce icon references to public URLs
 * Format: "standard:opportunity" or "utility:standard_objects"
 */
function getSalesforceIconUrl(iconRef: string): string | undefined {
  if (!iconRef) return undefined;
  
  const parts = iconRef.split(':');
  if (parts.length !== 2) return undefined;
  
  const [category, name] = parts;
  
  // Use SLDS icons from unpkg CDN
  // These are public URLs to the Salesforce Lightning Design System icons
  const baseUrl = 'https://unpkg.com/@salesforce-ux/design-system@2.24.5/assets/icons';
  
  // Map category to sprite folder
  const categoryMap: { [key: string]: string } = {
    'standard': 'standard',
    'utility': 'utility',
    'custom': 'custom',
    'action': 'action',
    'doctype': 'doctype',
  };
  
  const folder = categoryMap[category];
  if (!folder) return undefined;
  
  // Return URL to individual SVG file
  return `${baseUrl}/${folder}/${name}.svg`;
}

/**
 * Escapes XML special characters
 */
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds the complete draw.io XML document
 */
function buildDrawioXML(cells: any[], title: string): string {
  const xmlParts: string[] = [];
  
  xmlParts.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlParts.push('<mxfile host="app.diagrams.net" modified="' + new Date().toISOString() + '" agent="SF Explorer Board Converter" version="1.0.0" type="device">');
  xmlParts.push('  <diagram id="diagram1" name="' + escapeXml(title) + '">');
  xmlParts.push('    <mxGraphModel dx="1422" dy="794" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="1">');
  xmlParts.push('      <root>');

  // Add all cells
  for (const cell of cells) {
    // If tooltip exists, use UserObject wrapper
    if (cell.tooltip !== undefined) {
      // Replace newlines with &#xa; for XML tooltips
      const tooltipText = cell.tooltip.replace(/\n/g, '&#xa;');
      const labelText = cell.value || '';
      
      xmlParts.push('        <UserObject label="' + labelText + '" tooltip="' + tooltipText + '" id="' + cell.id + '">');
      xmlParts.push('          <mxCell');
    } else {
      xmlParts.push('        <mxCell id="' + cell.id + '"');
      if (cell.value !== undefined) {
        xmlParts[xmlParts.length - 1] += ' value="' + cell.value + '"';
      }
    }
    
    let cellXml = '';
    if (cell.style !== undefined) {
      cellXml += ' style="' + escapeXml(cell.style) + '"';
    }
    if (cell.vertex) {
      cellXml += ' vertex="' + cell.vertex + '"';
    }
    if (cell.edge) {
      cellXml += ' edge="' + cell.edge + '"';
    }
    if (cell.parent !== undefined) {
      cellXml += ' parent="' + cell.parent + '"';
    }
    if (cell.source !== undefined) {
      cellXml += ' source="' + cell.source + '"';
    }
    if (cell.target !== undefined) {
      cellXml += ' target="' + cell.target + '"';
    }
    if (cell.collapsed !== undefined) {
      cellXml += ' collapsed="' + cell.collapsed + '"';
    }
    
    xmlParts[xmlParts.length - 1] += cellXml + '>';

    // Add geometry if this is a vertex or edge
    if (cell.vertex || cell.edge) {
      let geometryXml = '            <mxGeometry';
      
      if (cell.x !== undefined) geometryXml += ' x="' + cell.x + '"';
      if (cell.y !== undefined) geometryXml += ' y="' + cell.y + '"';
      if (cell.width !== undefined) geometryXml += ' width="' + cell.width + '"';
      if (cell.height !== undefined) geometryXml += ' height="' + cell.height + '"';
      
      if (cell.edge) {
        geometryXml += ' as="geometry" relative="1">';
        xmlParts.push(geometryXml);
        xmlParts.push('              <mxPoint as="sourcePoint"/>');
        xmlParts.push('              <mxPoint as="targetPoint"/>');
        xmlParts.push('            </mxGeometry>');
      } else {
        geometryXml += ' as="geometry"';
        // Add alternateBounds if present (for collapsed state)
        if (cell.alternateBounds) {
          geometryXml += '>';
          xmlParts.push(geometryXml);
          xmlParts.push('              <mxRectangle width="' + cell.alternateBounds.width + '" height="' + cell.alternateBounds.height + '" as="alternateBounds"/>');
          xmlParts.push('            </mxGeometry>');
        } else {
          geometryXml += '/>';
          xmlParts.push(geometryXml);
        }
      }
    }

    // Close mxCell and UserObject if needed
    if (cell.tooltip !== undefined) {
      xmlParts.push('          </mxCell>');
      xmlParts.push('        </UserObject>');
    } else {
      xmlParts.push('        </mxCell>');
    }
  }

  xmlParts.push('      </root>');
  xmlParts.push('    </mxGraphModel>');
  xmlParts.push('  </diagram>');
  xmlParts.push('</mxfile>');

  return xmlParts.join('\n');
}

/**
 * Generates a viewer URL for draw.io with the diagram embedded
 * @param xml - The draw.io XML content
 * @returns A URL that can be opened directly in draw.io viewer
 */
export function generateViewerUrl(xml: string): string {
  // Draw.io viewer expects direct XML URL-encoding for the #R format
  // Format: https://viewer.diagrams.net/?params#R<url-encoded-xml>
  const encoded = encodeURIComponent(xml);
  
  // Using lightbox=1 for full-screen viewer with edit capabilities
  // User can move tables, zoom, pan, and save changes
  return `https://viewer.diagrams.net/?lightbox=1&highlight=0000ff&layers=1&nav=1&page-id=diagram1#R${encoded}`;
}

/**
 * Transforms a board and generates both XML and viewer URL
 * @param board - The board template to transform
 * @param options - Optional conversion options
 * @returns Object with xml and viewerUrl
 */
export function transformBoardWithViewerUrl(
  board: BoardTemplate,
  options: ConversionOptions = {}
): { xml: string; viewerUrl: string } {
  const xml = transformBoardToDrawIO(board, options);
  const viewerUrl = generateViewerUrl(xml);
  
  return { xml, viewerUrl };
}

// Export types for consumers
export * from './types';

