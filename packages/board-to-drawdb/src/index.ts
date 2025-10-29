import {
  BoardTemplate,
  BoardNode,
  BoardEdge,
  DrawDBSchema,
  DrawDBTable,
  DrawDBColumn,
  DrawDBIndex,
  DrawDBRelationship,
  DrawDBNote,
  DrawDBArea,
  ConversionOptions,
  SchemaProperty
} from './types';

/**
 * Transforms a Salesforce Explorer board template into a drawDB compatible format
 * @param board - The board template to transform
 * @param options - Optional conversion options
 * @returns A drawDB schema object
 */
export function transformBoardToDrawDB(
  board: BoardTemplate,
  options: ConversionOptions = {}
): DrawDBSchema {
  const {
    includeReadOnlyFields = true,
    includeGroupZones = true,
    defaultDatabase = 'generic',
    title = 'SF Explorer Board',
    onlyRelationshipFields = false
  } = options;

  const drawDBSchema: DrawDBSchema = {
    tables: [],
    relationships: [],
    notes: [],
    subjectAreas: [],
    database: defaultDatabase,
    types: [
      {
        name: 'LOOKUP',
        fields: [
          {
            name: 'Id',
            type: 'TEXT',
            size: 18
          }
        ],
        comment: 'Salesforce Lookup Relationship (Foreign Key)'
      },
      {
        name: 'CURRENCY',
        fields: [
          {
            name: 'amount',
            type: 'DECIMAL',
            size: 18
          },
          {
            name: 'currency_code',
            type: 'TEXT',
            size: 3
          }
        ],
        comment: 'Salesforce Currency with ISO code'
      },
      {
        name: 'PERCENT',
        fields: [
          {
            name: 'value',
            type: 'DECIMAL'
          }
        ],
        comment: 'Salesforce Percentage field'
      }
    ],
    title: title
  };

  // Maps to track node IDs to drawDB IDs
  const nodeIdToTableId = new Map<string, number>();
  const fieldIdToDrawDBId = new Map<string, number>();
  
  let tableIdCounter = 0;
  let relationshipIdCounter = 0;
  let noteIdCounter = 0;
  let areaIdCounter = 0;

  // First pass: Convert table nodes to drawDB tables
  const tableNodes = board.nodes.filter(node => node.type === 'table');
  
  for (const node of tableNodes) {
    const table = convertNodeToTable(
      node,
      tableIdCounter++,
      includeReadOnlyFields,
      onlyRelationshipFields,
      fieldIdToDrawDBId
    );
    
    if (table) {
      drawDBSchema.tables.push(table);
      nodeIdToTableId.set(node.id, table.id);
    }
  }

  // Second pass: Convert group zones to subject areas
  if (includeGroupZones) {
    const groupNodes = board.nodes.filter(node => node.type === 'groupZone');
    
    for (const node of groupNodes) {
      const area = convertNodeToArea(node, areaIdCounter++);
      if (area) {
        drawDBSchema.subjectAreas!.push(area);
        
        // Create a note for the group zone
        const note: DrawDBNote = {
          id: noteIdCounter++,
          x: node.position.x,
          y: node.position.y,
          title: node.data.label || `note_${noteIdCounter}`,
          content: node.data.content || '',
          locked: false,
          color: rgbaToHex(node.data.color || '#fcf7ac'),
          height: node.height || 66,
          width: node.width || 180
        };
        drawDBSchema.notes!.push(note);
      }
    }
  }

  // Third pass: Convert edges to relationships
  for (const edge of board.edges) {
    const relationship = convertEdgeToRelationship(
      edge,
      relationshipIdCounter++,
      nodeIdToTableId,
      fieldIdToDrawDBId,
      board.nodes
    );
    
    if (relationship) {
      drawDBSchema.relationships.push(relationship);
    }
  }

  return drawDBSchema;
}

/**
 * Converts a board node to a drawDB table
 */
function convertNodeToTable(
  node: BoardNode,
  tableId: number,
  includeReadOnlyFields: boolean,
  onlyRelationshipFields: boolean,
  fieldIdToDrawDBId: Map<string, number>
): DrawDBTable | null {
  if (!node.data.schema) {
    return null;
  }

  const fields: DrawDBColumn[] = [];
  let fieldIdCounter = 0;

  // Convert schema properties to drawDB fields
  const schema = node.data.schema;
  if (schema.properties) {
    for (const [fieldName, fieldProp] of Object.entries(schema.properties)) {
      // Always include primary key fields (typically "Id")
      const isPrimaryKey = fieldName === 'Id';
      
      // Check if this is a lookup field
      const isLookup = fieldProp['x-target'] !== undefined || (fieldName.endsWith('Id') && fieldName !== 'Id');
      
      // If onlyRelationshipFields is true, skip non-Id and non-lookup fields
      if (onlyRelationshipFields && !isPrimaryKey && !isLookup) {
        continue;
      }
      
      // Skip read-only fields if option is set (except primary keys)
      if (!includeReadOnlyFields && fieldProp.readOnly && !isPrimaryKey) {
        continue;
      }

      const drawDBFieldId = fieldIdCounter++;
      const drawDBField = convertPropertyToField(fieldName, fieldProp, drawDBFieldId);
      
      fields.push(drawDBField);
      
      // Store mapping for relationship building
      const fieldKey = `${node.id}.${fieldName}`;
      fieldIdToDrawDBId.set(fieldKey, drawDBFieldId);
    }
  }

  // Fallback for table name extraction
  let tableName: string;
  
  if (node.data.table?.name) {
    tableName = node.data.table.name;
  } else if (node.data.label) {
    tableName = node.data.label;
  } else {
    // Extract from node ID (e.g., "EntityDefinition/Product2" -> "Product2")
    tableName = node.id.split('/').pop() || node.id.replace(/^erd\./, '');
  }

  return {
    id: tableId,
    name: tableName,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    color: rgbaToHex(node.data.color || '#3b82f6'),
    comment: node.data.table?.description || node.data.schema.description || '',
    indices: [],
    fields
  };
}

/**
 * Converts a schema property to a drawDB field
 */
function convertPropertyToField(
  name: string,
  prop: SchemaProperty,
  fieldId: number
): DrawDBColumn {
  // Check if this is a lookup/foreign key field
  const isLookup = prop['x-target'] !== undefined || name.endsWith('Id') && name !== 'Id';
  
  // Map Salesforce/JSON Schema types to SQL types
  const sqlType = isLookup ? 'LOOKUP' : mapTypeToSQL(prop.type, prop.format);

  return {
    name,
    type: sqlType,
    default: prop.enum && prop.enum.length > 0 ? String(prop.enum[0]) : '',
    check: '',
    primary: name === 'Id',
    unique: name === 'Id',
    notNull: name === 'Id' || !prop.readOnly,
    increment: false,
    comment: prop.description || prop.title || '',
    id: fieldId
  };
}

/**
 * Converts RGBA color to hex format
 * e.g., "rgba(107, 99, 123, 0.4)" -> "#6b637b66"
 */
function rgbaToHex(color: string): string {
  // If already hex, return as is
  if (color.startsWith('#')) {
    return color;
  }

  // Match rgba format
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    
    // Convert to hex
    const toHex = (n: number) => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    
    const hexColor = '#' + toHex(r) + toHex(g) + toHex(b);
    
    // Add alpha channel if not fully opaque
    if (a < 1) {
      return hexColor + toHex(a * 255);
    }
    
    return hexColor;
  }
  
  // Return as is if not recognized format
  return color;
}

/**
 * Maps JSON Schema types to SQL types
 */
function mapTypeToSQL(type: string, format?: string): string {
  if (format) {
    switch (format) {
      case 'date':
        return 'DATE';
      case 'date-time':
        return 'TIMESTAMP';
      case 'email':
        return 'VARCHAR(255)';
      case 'uri':
      case 'url':
        return 'VARCHAR(2048)';
      default:
        break;
    }
  }

  switch (type) {
    case 'string':
      return 'VARCHAR(255)';
    case 'number':
      return 'NUMERIC';
    case 'integer':
      return 'INTEGER';
    case 'boolean':
      return 'BOOLEAN';
    case 'array':
      return 'JSON';
    case 'object':
      return 'JSON';
    default:
      return 'VARCHAR(255)';
  }
}

/**
 * Converts a group zone node to a drawDB subject area
 */
function convertNodeToArea(node: BoardNode, areaId: number): DrawDBArea | null {
  if (!node.width || !node.height) {
    return null;
  }

  return {
    id: areaId,
    name: node.data.label,
    x: Math.round(node.position.x),
    y: Math.round(node.position.y),
    width: Math.round(node.width),
    height: Math.round(node.height),
    color: rgbaToHex(node.data.color || '#e0e0e0'),
    locked: false
  };
}

/**
 * Converts a board edge to a drawDB relationship
 */
function convertEdgeToRelationship(
  edge: BoardEdge,
  relationshipId: number,
  nodeIdToTableId: Map<string, number>,
  fieldIdToDrawDBId: Map<string, number>,
  nodes: BoardNode[]
): DrawDBRelationship | null {
  const startTableId = nodeIdToTableId.get(edge.source);
  const endTableId = nodeIdToTableId.get(edge.target);

  if (startTableId === undefined || endTableId === undefined) {
    return null;
  }

  // Extract field names from handles if available
  const sourceFieldName = edge.sourceHandle?.replace(/-source.*$/, '');
  const targetFieldName = edge.targetHandle?.replace(/-target.*$/, '');

  if (!sourceFieldName || !targetFieldName) {
    return null;
  }

  // Get drawDB field IDs
  const startFieldKey = `${edge.source}.${sourceFieldName}`;
  const endFieldKey = `${edge.target}.${targetFieldName}`;

  const startFieldId = fieldIdToDrawDBId.get(startFieldKey);
  const endFieldId = fieldIdToDrawDBId.get(endFieldKey);

  if (startFieldId === undefined || endFieldId === undefined) {
    return null;
  }

  // Determine cardinality based on edge type
  let cardinality: DrawDBRelationship['cardinality'] = 'many_to_one';
  
  if (edge.type === 'betweenTablesInverted') {
    cardinality = 'one_to_many';
  } else if (edge.type === 'betweenTables') {
    cardinality = 'many_to_one';
  }

  // Check if it's a lookup relationship (many-to-one)
  const sourceNode = nodes.find(n => n.id === edge.source);
  if (sourceNode?.data.schema?.properties?.[sourceFieldName]?.['x-target']) {
    cardinality = 'many_to_one';
  }

  return {
    id: relationshipId,
    name: edge.label || edge.id,
    startTableId,
    endTableId,
    startFieldId,
    endFieldId,
    cardinality,
    updateConstraint: 'No action',
    deleteConstraint: 'No action'
  };
}

// Export types for consumers
export * from './types';

