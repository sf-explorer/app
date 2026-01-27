import {
  BoardTemplate,
  BoardNode,
  BoardEdge,
  ConversionOptions,
  SchemaProperty,
  DrawioCell,
  DrawioStyle
} from './types.js';

/**
 * Transforms a Salesforce Explorer board template into Draw.io XML format
 * 
 * This function converts a board template (containing nodes and edges) into a Draw.io-compatible
 * diagram. It supports both ERD (Entity-Relationship Diagram) and UML (Unified Modeling Language)
 * styles, with extensive customization options for field display, styling, and layout.
 * 
 * @param board - The board template to transform, containing nodes and edges
 * @param options - Optional conversion options to customize the output
 * @param options.includeReadOnlyFields - Include read-only fields in tables (default: true)
 * @param options.includeGroupZones - Include group zones from the board (default: true)
 * @param options.title - Title for the diagram (default: "SF Explorer Board")
 * @param options.showFieldTypes - Show field data types (default: true)
 * @param options.showDescriptions - Show field descriptions as tooltips (default: false)
 * @param options.tableWidth - Width of table cells in pixels (default: 200)
 * @param options.fieldHeight - Height of field rows in pixels (default: 26)
 * @param options.maxFields - Maximum number of fields to display per table (default: 20)
 * @param options.collapseTables - Collapse tables by default (default: true)
 * @param options.highlightCustomFields - Highlight Salesforce custom fields (ending with __c) (default: false)
 * @param options.customFieldsOnly - Show only custom fields (ending with __c) (default: false)
 * @param options.diagramStyle - Diagram style: 'erd' or 'uml' (default: 'erd')
 * @param options.umlOptions - UML-specific options (only applies when diagramStyle='uml')
 * 
 * @returns A Draw.io compatible XML string that can be imported into Draw.io
 * 
 * @throws {Error} If the board template is invalid (missing nodes or edges arrays)
 * 
 * @example
 * ```typescript
 * const board = {
 *   nodes: [{ id: '1', type: 'table', position: { x: 0, y: 0 }, data: { label: 'Account' } }],
 *   edges: []
 * };
 * const xml = transformBoardToDrawIO(board, { diagramStyle: 'erd' });
 * ```
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
    diagramStyle = 'erd',
    umlOptions = {},
    customFieldsOnly = false,
    highlightCustomFields = false,
  } = options;

  // UML options with defaults
  const {
    showVisibilityMarkers = true,
    groupByVisibility = false,
    relationshipStyle = 'smart',
  } = umlOptions;

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
    // Sort groups by Y position (top to bottom) so overlapping elements render correctly
    const groupNodes = board.nodes
      .filter(node => node.type === 'groupZone')
      .sort((a, b) => a.position.y - b.position.y);
    
    for (const node of groupNodes) {
      const cellId = getUniqueId(`group_${node.data.label || node.id}`);
      nodeIdToCellId.set(node.id, cellId);
      
      const cell = createGroupCell(node, cellId, showDescriptions);
      cells.push(cell);
    }
  }

  // Second pass: Convert table nodes
  // Sort tables by Y position (top to bottom) so overlapping tables render correctly
  const tableNodes = board.nodes
    .filter(node => node.type === 'table')
    .sort((a, b) => a.position.y - b.position.y);
  
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

    let tableCells: DrawioCell[];
    
    if (diagramStyle === 'uml') {
      // Use UML class shape
      tableCells = createUmlClassCells(
        node,
        tableName,
        parentCellId,
        includeReadOnlyFields,
        showFieldTypes,
        showDescriptions,
        tableWidth,
        fieldHeight,
        maxFields,
        showVisibilityMarkers,
        groupByVisibility,
        highlightCustomFields,
        customFieldsOnly,
        fieldIdToCellId,
        getUniqueId
      );
    } else {
      // Use ERD swimlane style
      tableCells = createTableCells(
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
        highlightCustomFields,
        customFieldsOnly,
        fieldIdToCellId,
        getUniqueId
      );
    }
    
    // Store the main table cell ID - if we have an annotation, the first cell is the group
    // In that case, the actual table is the second cell
    if (tableCells.length > 0) {
      if (node.data.annotation && tableCells.length > 1) {
        // First cell is group, second cell is annotation or table
        // Find the actual table cell (it has children/fields)
        const tableCell = tableCells.find(c => c.id.startsWith('table_') || c.id.startsWith('uml_class_'));
        if (tableCell) {
          nodeIdToCellId.set(node.id, tableCell.id);
        }
      } else {
        // No annotation, first cell is the table
        nodeIdToCellId.set(node.id, tableCells[0].id);
      }
    }
    
    cells.push(...tableCells);
  }

  // Third pass: Convert other node types (markdown, callout, annotation)
  // Skip types that don't render well: input, legend
  // Sort by Y position (top to bottom) so overlapping elements render correctly
  const skipTypes = ['input', 'legend'];
  const otherNodes = board.nodes
    .filter(node => !['table', 'groupZone', ...skipTypes].includes(node.type))
    .sort((a, b) => a.position.y - b.position.y);

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
      
      // Get source and target node names for tooltip
      const sourceNode = board.nodes.find(n => n.id === edge.source);
      const targetNode = board.nodes.find(n => n.id === edge.target);
      const sourceName = sourceNode?.data?.label || sourceNode?.data?.table?.name || edge.source;
      const targetName = targetNode?.data?.label || targetNode?.data?.table?.name || edge.target;
      
      let cell: DrawioCell;
      if (diagramStyle === 'uml') {
        cell = createUmlEdgeCell(edge, cellId, sourceId, targetId, relationshipStyle, sourceName, targetName);
      } else {
        cell = createEdgeCell(edge, cellId, sourceId, targetId, sourceName, targetName);
      }
      
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
 * Uses the same swimlane stackLayout structure as UML, but with ERD styling
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
  highlightCustomFields: boolean,
  customFieldsOnly: boolean,
  fieldIdToCellId: Map<string, string>,
  getUniqueId: (preferred: string) => string
): DrawioCell[] {
  const cells: DrawioCell[] = [];
  const color = rgbaToHex(node.data.color || '#3b82f6');
  
  // Check if we need to create a group wrapper for annotation
  const hasAnnotation = !!node.data.annotation;
  let groupCellId: string | undefined;
  let actualParentId = parentId;
  const annotationBadgeHeight = 34;
  const annotationTopMargin = 20;
  
  if (hasAnnotation) {
    // Create group wrapper
    groupCellId = getUniqueId(`group_${tableName}_annotation`);
    actualParentId = groupCellId;
  }

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
      const isReferenceField = fieldProp['x-target'] !== undefined;
      const isCustomField = fieldName.endsWith('__c');
      
      // Skip read-only fields if option is set (except primary keys and reference fields)
      if (!includeReadOnlyFields && fieldProp.readOnly && !isPrimaryKey && !isReferenceField) {
        continue;
      }

      // Skip non-custom fields if customFieldsOnly is set
      if (customFieldsOnly && !isCustomField) {
        continue;
      }

      fields.push({
        name: fieldName,
        type: mapTypeToDisplay(fieldProp.type, fieldProp.format, isForeignKey, !!fieldProp.enum),
        isPrimary: isPrimaryKey,
        isForeign: isForeignKey,
        referencedTable: fieldProp['x-target'],
        description: fieldProp.description || fieldProp.title || ''
      });
    }
  }

  // Group fields: Primary key first, then reference fields (x-target), then regular fields
  fields.sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1;
    if (!a.isPrimary && b.isPrimary) return 1;
    if (a.referencedTable && !b.referencedTable) return -1;
    if (!a.referencedTable && b.referencedTable) return 1;
    return 0;
  });

  // Limit the number of fields if maxFields is set
  const displayFields = fields.slice(0, maxFields);
  const hasMoreFields = fields.length > maxFields;

  // Get icon URL if available - if there's an icon, make header taller
  const iconUrl = node.data.icon ? getSalesforceIconUrl(node.data.icon) : undefined;
  const headerHeight = iconUrl ? 60 : 30;
  
  const totalFields = displayFields.length + (hasMoreFields ? 1 : 0);
  const tableHeight = headerHeight + (fieldHeight * totalFields);
  const tableCellId = getUniqueId(`table_${tableName}`);
  
  // ERD table style using swimlane with stackLayout (same as UML, but with ERD styling)
  const tableStyle = buildStyle({
    swimlane: 1,
    fontStyle: 1, // Bold for table name
    fontSize: 14, // 14px font size for table name
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
    whiteSpace: 'wrap',
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
  
  // Calculate position based on whether we have a group wrapper
  const tableX = hasAnnotation ? 0 : Math.round(node.position.x);
  const tableY = hasAnnotation ? annotationTopMargin : Math.round(node.position.y);
  
  cells.push({
    id: tableCellId,
    value: escapeXml(tableName),
    style: tableStyle,
    vertex: '1',
    parent: actualParentId,
    x: tableX,
    y: tableY,
    width: tableWidth,
    height: displayHeight,
    collapsed: collapseTables ? '1' : '0',
    alternateBounds: {
      width: tableWidth,
      height: alternateHeight,
    },
    tooltip: escapeXml(tableTooltip)
  });

  // Create field cells using same structure as UML
  let currentY = headerHeight;
  for (const field of displayFields) {
    const fieldCellId = getUniqueId(`${tableName}_${field.name}`);
    
    // Store field cell ID for edge connections
    const fieldKey = `${node.id}.${field.name}`;
    fieldIdToCellId.set(fieldKey, fieldCellId);
    
    // Build field label with ERD prefixes
    let fieldLabel = '';
    
    // Add ERD prefix
    if (field.isPrimary) {
      fieldLabel = 'PK: ';
    } else if (field.isForeign) {
      fieldLabel = 'FK: ';
    }
    
    // Add field name
    fieldLabel += escapeXml(field.name);
    
    // Add type if requested
    if (showFieldTypes) {
      if (field.isForeign && field.referencedTable) {
        fieldLabel += ` : ${escapeXml(field.referencedTable)}`;
      } else {
        fieldLabel += ` : ${escapeXml(field.type)}`;
      }
    }
    
    // Add description if requested
    if (showDescriptions && field.description) {
      fieldLabel += `\n${escapeXml(field.description.substring(0, 80))}`;
    }

    // Check if this is a custom field (ends with __c)
    const isCustom = field.name.endsWith('__c');
    
    // ERD field styling with header color differentiation
    let fillColor = '#ffffff'; // White background for fields
    let fontStyle = 0;
    let strokeColor = darkenColor(color, 10);
    let strokeWidth = 1;
    
    if (field.isPrimary) {
      fillColor = lightenColor(color, 30); // Lighter shade for PK
      fontStyle = 1; // Bold
    }
    // Foreign keys remain white - no special coloring
    
    // Highlight custom fields if option is enabled
    if (highlightCustomFields && isCustom) {
      fillColor = '#FFE6CC'; // Light orange for custom fields
      strokeColor = '#FF9900'; // Orange border
      strokeWidth = 2;
    }

    const fieldStyle = buildStyle({
      text: 1,
      strokeColor,
      fillColor,
      align: 'left',
      verticalAlign: 'top',
      spacingLeft: 4,
      spacingRight: 4,
      overflow: 'hidden',
      rotatable: 0,
      points: '[[0,0.5],[1,0.5]]',
      portConstraint: 'eastwest',
      whiteSpace: 'nowrap',
      html: 1,
      fontSize: 12,
      fontStyle,
      strokeWidth,
      bottomBorder: 1, // Add bottom border line separator
      shadow: 0,  // No shadow on text fields
    });

    const fieldCell: DrawioCell = {
      id: fieldCellId,
      value: fieldLabel,
      style: fieldStyle,
      vertex: '1',
      movable: '0', // Make field non-movable
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
    
    currentY += fieldHeight;
  }

  // Add "... N more fields" indicator if there are hidden fields
  if (hasMoreFields) {
    const moreCellId = getUniqueId(`${tableName}_more`);
    const moreCount = fields.length - maxFields;
    const moreStyle = buildStyle({
      text: 1,
      strokeColor: darkenColor(color, 10),
      fillColor: lightenColor(color, 40),
      align: 'center',
      verticalAlign: 'top',
      spacingLeft: 4,
      spacingRight: 4,
      overflow: 'hidden',
      rotatable: 0,
      points: '[[0,0.5],[1,0.5]]',
      portConstraint: 'eastwest',
      whiteSpace: 'nowrap',
      html: 1,
      fontSize: 11,
      fontStyle: 2, // italic
      bottomBorder: 0, // No bottom border on last item
      shadow: 0,  // No shadow on text fields
    });

    cells.push({
      id: moreCellId,
      value: escapeXml(`... ${moreCount} more field${moreCount > 1 ? 's' : ''}`),
      style: moreStyle,
      vertex: '1',
      movable: '0', // Make non-movable
      parent: tableCellId,
      x: 0,
      y: currentY,
      width: tableWidth,
      height: fieldHeight,
    });
  }

  // If we have an annotation, add the group wrapper and annotation badge
  if (hasAnnotation && groupCellId) {
    // Calculate total group height (annotation badge + margin + table)
    const groupHeight = annotationBadgeHeight + displayHeight;
    
    // Create group cell (must be first in returned array)
    const groupCell: DrawioCell = {
      id: groupCellId,
      value: '',
      style: 'group',
      vertex: '1',
      connectable: '0',
      parent: parentId,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
      width: tableWidth,
      height: groupHeight,
    };
    
    // Create annotation badge
    const annotationCellId = getUniqueId(`${tableName}_annotation_badge`);
    const annotationBadgeWidth = 60;
    const annotationBadgeX = tableWidth - annotationBadgeWidth;
    
    const annotationStyle = buildStyle({
      rounded: 1,
      whiteSpace: 'wrap',
      html: 1,
      fillColor: '#ffe6cc',
      strokeColor: '#d79b00',
      arcSize: 9,
    });
    
    const annotationCell: DrawioCell = {
      id: annotationCellId,
        value: escapeXml(`<b>${node.data.annotation!}</b>`),
      style: annotationStyle,
      vertex: '1',
      parent: groupCellId,
      x: annotationBadgeX,
      y: 0,
      width: annotationBadgeWidth,
      height: annotationBadgeHeight,
    };
    
    // Return with group first, then table and fields, then annotation on top
    return [groupCell, ...cells, annotationCell];
  }

  return cells;
}

/**
 * Creates a UML class box using draw.io's native UML format
 * Uses swimlane with stackLayout and separate text cells for each field
 */
function createUmlClassCells(
  node: BoardNode,
  tableName: string,
  parentId: string,
  includeReadOnlyFields: boolean,
  showFieldTypes: boolean,
  showDescriptions: boolean,
  tableWidth: number,
  fieldHeight: number,
  maxFields: number,
  showVisibilityMarkers: boolean,
  groupByVisibility: boolean,
  highlightCustomFields: boolean,
  customFieldsOnly: boolean,
  fieldIdToCellId: Map<string, string>,
  getUniqueId: (preferred: string) => string
): DrawioCell[] {
  const cells: DrawioCell[] = [];
  const color = rgbaToHex(node.data.color || '#3b82f6');
  
  // Check if we need to create a group wrapper for annotation
  const hasAnnotation = !!node.data.annotation;
  let groupCellId: string | undefined;
  let actualParentId = parentId;
  const annotationBadgeHeight = 34;
  const annotationTopMargin = 20;
  
  if (hasAnnotation) {
    // Create group wrapper
    groupCellId = getUniqueId(`group_${tableName}_annotation`);
    actualParentId = groupCellId;
  }

  // Get fields from schema
  const fields: Array<{
    name: string;
    type: string;
    isPrimary: boolean;
    isForeign: boolean;
    referencedTable?: string;
    description: string;
    visibility: string; // + public, - private, # protected
  }> = [];

  if (node.data.schema?.properties) {
    for (const [fieldName, fieldProp] of Object.entries(node.data.schema.properties)) {
      const isPrimaryKey = fieldName === 'Id';
      const isForeignKey = fieldProp['x-target'] !== undefined || 
                          (fieldName.endsWith('Id') && fieldName !== 'Id');
      const isReferenceField = fieldProp['x-target'] !== undefined;
      const isCustomField = fieldName.endsWith('__c');
      
      // Skip read-only fields if option is set (except primary keys and reference fields)
      if (!includeReadOnlyFields && fieldProp.readOnly && !isPrimaryKey && !isReferenceField) {
        continue;
      }

      // Skip non-custom fields if customFieldsOnly is set
      if (customFieldsOnly && !isCustomField) {
        continue;
      }

      // Determine visibility marker
      let visibility = '+'; // public by default
      if (fieldProp.readOnly && !isPrimaryKey) {
        visibility = '-'; // private for readonly
      }

      fields.push({
        name: fieldName,
        type: mapTypeToDisplay(fieldProp.type, fieldProp.format, isForeignKey, !!fieldProp.enum),
        isPrimary: isPrimaryKey,
        isForeign: isForeignKey,
        referencedTable: fieldProp['x-target'],
        description: fieldProp.description || fieldProp.title || '',
        visibility
      });
    }
  }

  // Group by visibility if requested (PK first, then reference fields, then normal fields)
  if (groupByVisibility) {
    fields.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      if (a.referencedTable && !b.referencedTable) return -1;
      if (!a.referencedTable && b.referencedTable) return 1;
      return 0;
    });
  } else {
    // Default grouping: Primary key first, then reference fields (x-target), then regular fields
    fields.sort((a, b) => {
      if (a.isPrimary && !b.isPrimary) return -1;
      if (!a.isPrimary && b.isPrimary) return 1;
      if (a.referencedTable && !b.referencedTable) return -1;
      if (!a.referencedTable && b.referencedTable) return 1;
      return 0;
    });
  }

  // Limit the number of fields if maxFields is set
  const displayFields = fields.slice(0, maxFields);
  const hasMoreFields = fields.length > maxFields;

  // Get icon URL if available - if there's an icon, make header taller
  const iconUrl = node.data.icon ? getSalesforceIconUrl(node.data.icon) : undefined;
  const headerHeight = iconUrl ? 60 : 26;
  
  const totalFields = displayFields.length + (hasMoreFields ? 1 : 0);
  const classHeight = headerHeight + (fieldHeight * totalFields);
  
  const tableCellId = getUniqueId(`uml_class_${tableName}`);
  
  // Build tooltip for class
  let classTooltip = `${fields.length} attribute${fields.length !== 1 ? 's' : ''}`;
  if (hasMoreFields) {
    classTooltip += ` (showing ${displayFields.length})`;
  }
  if (node.data.schema?.description) {
    classTooltip += `\n${node.data.schema.description}`;
  }

  // UML Class container using swimlane with stackLayout (native draw.io format)
  const classStyle = buildStyle({
    swimlane: 1,
    fontStyle: 1, // Bold for class name
    fontSize: 14, // 14px font size for class name
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
    align: 'center',
    verticalAlign: 'middle',
    whiteSpace: 'wrap',
    html: 1,
    ...(iconUrl ? {
      image: iconUrl,
    } : {}),
  });

  // Calculate position based on whether we have a group wrapper
  const classX = hasAnnotation ? 0 : Math.round(node.position.x);
  const classY = hasAnnotation ? annotationTopMargin : Math.round(node.position.y);
  
  cells.push({
    id: tableCellId,
    value: escapeXml(tableName),
    style: classStyle,
    vertex: '1',
    parent: actualParentId,
    x: classX,
    y: classY,
    width: tableWidth,
    height: classHeight,
    tooltip: escapeXml(classTooltip)
  });

  // Create field cells (attributes)
  let currentY = headerHeight;
  for (const field of displayFields) {
    const fieldCellId = getUniqueId(`${tableName}_${field.name}`);
    
    // Store field cell ID for edge connections
    const fieldKey = `${node.id}.${field.name}`;
    fieldIdToCellId.set(fieldKey, fieldCellId);
    
    // Build field label
    let fieldLabel = '';
    
    // Add visibility marker
    if (showVisibilityMarkers) {
      fieldLabel += field.visibility + ' ';
    }
    
    // Add field name
    fieldLabel += escapeXml(field.name);
    
    // Add type if requested
    if (showFieldTypes) {
      if (field.isForeign && field.referencedTable) {
        fieldLabel += ' : ' + escapeXml(field.referencedTable);
      } else {
        fieldLabel += ' : ' + escapeXml(field.type);
      }
    }

    // Check if this is a custom field (ends with __c)
    const isCustom = field.name.endsWith('__c');
    
    // UML field style - text cell
    let fillColor = '#ffffff'; // White background for fields
    let strokeColor = darkenColor(color, 10);
    let strokeWidth = 1;
    
    // Highlight custom fields if option is enabled
    if (highlightCustomFields && isCustom) {
      fillColor = '#FFE6CC'; // Light orange for custom fields
      strokeColor = '#FF9900'; // Orange border
      strokeWidth = 2;
    }
    
    const fieldStyle = buildStyle({
      text: 1,
      strokeColor,
      fillColor,
      align: 'left',
      verticalAlign: 'top',
      spacingLeft: 4,
      spacingRight: 4,
      overflow: 'hidden',
      rotatable: 0,
      points: '[[0,0.5],[1,0.5]]',
      portConstraint: 'eastwest',
      whiteSpace: 'nowrap',
      html: 1,
      strokeWidth,
      bottomBorder: 1, // Add bottom border line separator
      shadow: 0,  // No shadow on text fields
    });

    const fieldCell: DrawioCell = {
      id: fieldCellId,
      value: fieldLabel,
      style: fieldStyle,
      vertex: '1',
      movable: '0', // Make field non-movable
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
      strokeColor: darkenColor(color, 10),
      fillColor: '#ffffff', // White background for fields
      align: 'center',
      verticalAlign: 'top',
      spacingLeft: 4,
      spacingRight: 4,
      overflow: 'hidden',
      rotatable: 0,
      points: '[[0,0.5],[1,0.5]]',
      portConstraint: 'eastwest',
      whiteSpace: 'nowrap',
      html: 1,
      fontStyle: 2, // italic
      bottomBorder: 0, // No bottom border on last item
      shadow: 0,  // No shadow on text fields
    });

    cells.push({
      id: moreCellId,
      value: escapeXml(`... ${moreCount} more field${moreCount > 1 ? 's' : ''}`),
      style: moreStyle,
      vertex: '1',
      movable: '0', // Make non-movable
      parent: tableCellId,
      x: 0,
      y: currentY,
      width: tableWidth,
      height: fieldHeight,
    });
  }

  // If we have an annotation, add the group wrapper and annotation badge
  if (hasAnnotation && groupCellId) {
    // Calculate total group height (annotation badge + margin + class)
    const groupHeight = annotationBadgeHeight + classHeight;
    
    // Create group cell (must be first in returned array)
    const groupCell: DrawioCell = {
      id: groupCellId,
      value: '',
      style: 'group',
      vertex: '1',
      connectable: '0',
      parent: parentId,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
      width: tableWidth,
      height: groupHeight,
    };
    
    // Create annotation badge
    const annotationCellId = getUniqueId(`${tableName}_annotation_badge`);
    const annotationBadgeWidth = 60;
    const annotationBadgeX = tableWidth - annotationBadgeWidth;
    
    const annotationStyle = buildStyle({
      rounded: 1,
      whiteSpace: 'wrap',
      html: 1,
      fillColor: '#ffe6cc',
      strokeColor: '#d79b00',
      arcSize: 9,
    });
    
    const annotationCell: DrawioCell = {
      id: annotationCellId,
        value: escapeXml(`<b>${node.data.annotation!}</b>`),
      style: annotationStyle,
      vertex: '1',
      parent: groupCellId,
      x: annotationBadgeX,
      y: 0,
      width: annotationBadgeWidth,
      height: annotationBadgeHeight,
    };
    
    // Return with group first, then class and fields, then annotation on top
    return [groupCell, ...cells, annotationCell];
  }

  return cells;
}

/**
 * Creates a draw.io cell for a generic node (markdown, callout, annotation)
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
  targetId: string,
  sourceName: string,
  targetName: string
): DrawioCell {
  const label = edge.label ? escapeXml(edge.label) : '';
  
  // Determine arrow style based on edge type
  // Using proper ERD notation
  let endArrow = 'ERone';
  let startArrow = 'ERmany';
  let relationshipType = 'Many-to-One';

  if (edge.type === 'betweenTablesInverted') {
    // For inverted edges: source has FK, target is referenced table
    // Visual: InvoiceLine (many) → Invoice (one)
    // So we want ERmany at source, ERone at target
    endArrow = 'ERone';
    startArrow = 'ERmany';
    relationshipType = 'Many-to-One';
  } else if (edge.type === 'betweenTables') {
    // Standard edge: source has FK, target is referenced table
    // Visual: BillingPolicy (many) → BillingTreatment (one)
    // Same as inverted: ERmany at source, ERone at target
    endArrow = 'ERone';
    startArrow = 'ERmany';
    relationshipType = 'Many-to-One';
  } else {
    // Custom edges or other types - default behavior
    endArrow = 'ERone';
    startArrow = 'ERmany';
    relationshipType = 'Relationship';
  }

  // Read edge style properties from edge.style if available
  const edgeStyle = edge.style || {};
  
  // Extract style properties with defaults
  const strokeWidth = edgeStyle.strokeWidth ?? 2;
  let strokeColor = edgeStyle.stroke || edgeStyle.strokeColor || '#6c757d';
  
  // Sanitize CSS variables - draw.io doesn't support CSS variables like rgb(var(--variable))
  // Replace any CSS variable references with a valid color
  if (typeof strokeColor === 'string' && (strokeColor.includes('var(') || strokeColor.includes('--'))) {
    strokeColor = '#6c757d'; // Default gray color
  }
  
  const fontSize = edgeStyle.fontSize ?? 12;
  const opacity = edgeStyle.opacity !== undefined ? Math.round(edgeStyle.opacity * 100) : undefined;
  
  // Handle dashed lines - React Flow uses strokeDasharray, Draw.io uses dashPattern
  let dashPattern: string | undefined;
  if (edgeStyle.strokeDasharray) {
    // Convert strokeDasharray (e.g., "5,5" or [5, 5]) to Draw.io dashPattern format
    if (Array.isArray(edgeStyle.strokeDasharray)) {
      dashPattern = edgeStyle.strokeDasharray.join(',');
    } else if (typeof edgeStyle.strokeDasharray === 'string') {
      dashPattern = edgeStyle.strokeDasharray;
    }
  }
  
  // Determine edge routing style
  let routingStyle = 'orthogonalEdgeStyle';
  let curved = 0;
  let rounded = 0;
  
  if (edgeStyle.curved !== undefined && edgeStyle.curved !== false) {
    // If curved is explicitly set to true, use curved edge style
    routingStyle = 'curvedEdgeStyle';
    curved = 1;
    rounded = 1;
  } else if (edgeStyle.edgeStyle) {
    // Allow explicit edgeStyle override
    routingStyle = edgeStyle.edgeStyle;
    if (edgeStyle.edgeStyle === 'curvedEdgeStyle' || edgeStyle.edgeStyle === 'curved') {
      curved = 1;
      rounded = 1;
    }
  }

  const styleObj: DrawioStyle = {
    edgeStyle: routingStyle,
    rounded,
    orthogonalLoop: routingStyle === 'orthogonalEdgeStyle' ? 1 : 0,
    jettySize: 'auto',
    fontSize,
    html: 1,
    endArrow,
    startArrow,
    endFill: 0,
    startFill: 0,
    strokeWidth,
    strokeColor,
    curved,
    shadow: 0,  // No shadow on edges
  };
  
  // Add dashPattern if provided
  if (dashPattern) {
    styleObj.dashPattern = dashPattern;
  }
  
  // Add opacity if provided
  if (opacity !== undefined) {
    styleObj.opacity = opacity;
  }

  const style = buildStyle(styleObj);

  // Build informative tooltip
  const sourceHandle = edge.sourceHandle?.replace(/-(source|target)(-inv)?$/, '') || '';
  const targetHandle = edge.targetHandle?.replace(/-(source|target)(-inv)?$/, '') || '';
  
  let tooltip = `${relationshipType}: ${sourceName} → ${targetName}`;
  if (sourceHandle) {
    tooltip += `\nFrom: ${sourceName}.${sourceHandle}`;
  }
  if (targetHandle) {
    tooltip += `\nTo: ${targetName}.${targetHandle}`;
  }
  if (edge.label) {
    tooltip += `\nLabel: ${edge.label}`;
  }

  return {
    id: cellId,
    value: label,
    style,
    edge: '1',
    parent: '1',
    source: sourceId,
    target: targetId,
    tooltip: escapeXml(tooltip),
  };
}

/**
 * Creates a draw.io cell for a UML relationship
 */
function createUmlEdgeCell(
  edge: BoardEdge,
  cellId: string,
  sourceId: string,
  targetId: string,
  relationshipStyle: 'association' | 'smart',
  sourceName: string,
  targetName: string
): DrawioCell {
  const label = edge.label ? escapeXml(edge.label) : '';
  
  // Determine UML relationship type
  let endArrow = 'open'; // Simple arrow for association
  let startArrow = 'none';
  let endFill = 0;
  let startFill = 0;
  let relationshipType = 'Association';
  
  if (relationshipStyle === 'smart') {
    // Smart inference based on edge type and Salesforce relationship patterns
    if (edge.type === 'betweenTablesInverted' || edge.type === 'betweenTables') {
      // Foreign key relationships - use composition (strong ownership)
      // Draw.io composition: filled diamond at the "whole" side
      // For FK: source has FK, target is referenced (target is "whole")
      endArrow = 'diamondThin';
      endFill = 1; // filled diamond = composition
      startArrow = 'none';
      relationshipType = 'Composition';
    } else {
      // Default: simple association
      endArrow = 'open';
      startArrow = 'none';
      relationshipType = 'Association';
    }
  } else {
    // Simple association for all relationships
    endArrow = 'open';
    startArrow = 'none';
    relationshipType = 'Association';
  }

  // Read edge style properties from edge.style if available
  const edgeStyle = edge.style || {};
  
  // Extract style properties with defaults
  const strokeWidth = edgeStyle.strokeWidth ?? 1.5;
  let strokeColor = edgeStyle.stroke || edgeStyle.strokeColor || '#6c757d';
  
  // Sanitize CSS variables - draw.io doesn't support CSS variables like rgb(var(--variable))
  // Replace any CSS variable references with a valid color
  if (typeof strokeColor === 'string' && (strokeColor.includes('var(') || strokeColor.includes('--'))) {
    strokeColor = '#6c757d'; // Default gray color
  }
  
  const fontSize = edgeStyle.fontSize ?? 11;
  const opacity = edgeStyle.opacity !== undefined ? Math.round(edgeStyle.opacity * 100) : undefined;
  
  // Handle dashed lines - React Flow uses strokeDasharray, Draw.io uses dashPattern
  let dashPattern: string | undefined;
  if (edgeStyle.strokeDasharray) {
    // Convert strokeDasharray (e.g., "5,5" or [5, 5]) to Draw.io dashPattern format
    if (Array.isArray(edgeStyle.strokeDasharray)) {
      dashPattern = edgeStyle.strokeDasharray.join(',');
    } else if (typeof edgeStyle.strokeDasharray === 'string') {
      dashPattern = edgeStyle.strokeDasharray;
    }
  }
  
  // Determine edge routing style
  let routingStyle = 'orthogonalEdgeStyle';
  let curved = 0;
  let rounded = 0;
  
  if (edgeStyle.curved !== undefined && edgeStyle.curved !== false) {
    // If curved is explicitly set to true, use curved edge style
    routingStyle = 'curvedEdgeStyle';
    curved = 1;
    rounded = 1;
  } else if (edgeStyle.edgeStyle) {
    // Allow explicit edgeStyle override
    routingStyle = edgeStyle.edgeStyle;
    if (edgeStyle.edgeStyle === 'curvedEdgeStyle' || edgeStyle.edgeStyle === 'curved') {
      curved = 1;
      rounded = 1;
    }
  }

  const styleObj: DrawioStyle = {
    edgeStyle: routingStyle,
    rounded,
    orthogonalLoop: routingStyle === 'orthogonalEdgeStyle' ? 1 : 0,
    jettySize: 'auto',
    fontSize,
    html: 1,
    endArrow,
    startArrow,
    endFill,
    startFill,
    strokeWidth,
    strokeColor,
    curved,
    shadow: 0,  // No shadow on edges
  };
  
  // Add dashPattern if provided
  if (dashPattern) {
    styleObj.dashPattern = dashPattern;
  }
  
  // Add opacity if provided
  if (opacity !== undefined) {
    styleObj.opacity = opacity;
  }

  const style = buildStyle(styleObj);

  // Build informative tooltip
  const sourceHandle = edge.sourceHandle?.replace(/-(source|target)(-inv)?$/, '') || '';
  const targetHandle = edge.targetHandle?.replace(/-(source|target)(-inv)?$/, '') || '';
  
  let tooltip = `${relationshipType}: ${sourceName} → ${targetName}`;
  if (sourceHandle) {
    tooltip += `\nFrom: ${sourceName}.${sourceHandle}`;
  }
  if (targetHandle) {
    tooltip += `\nTo: ${targetName}.${targetHandle}`;
  }
  if (edge.label) {
    tooltip += `\nLabel: ${edge.label}`;
  }

  return {
    id: cellId,
    value: label,
    style,
    edge: '1',
    parent: '1',
    source: sourceId,
    target: targetId,
    tooltip: escapeXml(tooltip),
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
function mapTypeToDisplay(type: string, format?: string, isForeign?: boolean, hasEnum?: boolean): string {
  if (isForeign) {
    return 'FK';
  }

  // Check for enum constraint
  if (hasEnum) {
    return 'Enum';
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
    if (cell.movable !== undefined) {
      cellXml += ' movable="' + cell.movable + '"';
    }
    if (cell.connectable !== undefined) {
      cellXml += ' connectable="' + cell.connectable + '"';
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
 * Generates a Draw.io viewer URL with the diagram embedded
 * 
 * This function creates a URL that can be opened directly in the Draw.io online viewer.
 * The diagram is embedded in the URL using the #R format with URL-encoded XML.
 * The viewer is configured with lightbox mode for full-screen viewing with edit capabilities.
 * 
 * @param xml - The Draw.io XML content to embed in the URL
 * @returns A URL that opens the diagram in Draw.io viewer (viewer.diagrams.net)
 * 
 * @example
 * ```typescript
 * const xml = transformBoardToDrawIO(board);
 * const url = generateViewerUrl(xml);
 * console.log(url); // https://viewer.diagrams.net/?lightbox=1...#R<encoded-xml>
 * ```
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
 * Transforms a board template and generates both XML and a viewer URL
 * 
 * This is a convenience function that combines `transformBoardToDrawIO` and `generateViewerUrl`
 * into a single call. It returns both the Draw.io XML string and a viewer URL that can be
 * opened directly in a browser.
 * 
 * @param board - The board template to transform, containing nodes and edges
 * @param options - Optional conversion options (see `transformBoardToDrawIO` for details)
 * @returns An object containing both the XML string and viewer URL
 * @returns {string} xml - The Draw.io XML content
 * @returns {string} viewerUrl - The viewer URL with embedded diagram
 * 
 * @example
 * ```typescript
 * const board = {
 *   nodes: [{ id: '1', type: 'table', position: { x: 0, y: 0 }, data: { label: 'Account' } }],
 *   edges: []
 * };
 * const { xml, viewerUrl } = transformBoardWithViewerUrl(board, { diagramStyle: 'uml' });
 * console.log('Open in browser:', viewerUrl);
 * ```
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
export * from './types.js';

