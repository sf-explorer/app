/**
 * Board Template Types
 */

/**
 * Represents a 2D position with x and y coordinates
 */
export interface Position {
  /** Horizontal position in pixels */
  x: number;
  /** Vertical position in pixels */
  y: number;
}

/**
 * Data associated with a board node, containing display and metadata information
 */
export interface NodeData {
  /** Display label for the node */
  label: string;
  /** Optional content text */
  content?: string;
  /** Optional icon identifier or URL */
  icon?: string;
  /** Optional color for the node */
  color?: string;
  /** Optional annotation badge (e.g., "20k" for record limits) */
  annotation?: string;
  /** Optional unique identifier */
  Id?: string;
  /** Optional table data for entity nodes */
  table?: TableData;
  /** Optional JSON schema for structured data */
  schema?: JSONSchema;
  /** Optional HTTP method for API nodes */
  method?: string;
  /** Optional URL for API or resource nodes */
  url?: string;
  /** Optional request body for API nodes */
  body?: string;
}

/**
 * Metadata for a database table or Salesforce object
 */
export interface TableData {
  /** Technical name of the table */
  name: string;
  /** Display label for the table */
  label: string;
  /** Optional description of the table */
  description?: string;
  /** Array of column definitions */
  columns: any[];
}

/**
 * JSON Schema definition for structured data validation
 */
export interface JSONSchema {
  /** Schema type (e.g., "object", "array") */
  type: string;
  /** Optional description of the schema */
  description?: string;
  /** Object properties mapped by property name */
  properties: {
    [key: string]: SchemaProperty;
  };
}

/**
 * Individual property definition within a JSON Schema
 */
export interface SchemaProperty {
  /** Data type of the property (e.g., "string", "number", "boolean") */
  type: string;
  /** Display title for the property */
  title: string;
  /** Optional description of the property */
  description?: string;
  /** Optional format specifier (e.g., "date-time", "email") */
  format?: string;
  /** Whether the property is read-only */
  readOnly?: boolean;
  /** Optional enumeration of allowed values */
  enum?: any[];
  /** Optional display names for enum values */
  enumNames?: any[];
  /** Optional reference to a related entity (Salesforce-specific) */
  'x-target'?: string;
  /** Optional schema for array items */
  items?: any;
}

/**
 * Represents a node in a board template (e.g., table, group, or other visual element)
 */
export interface BoardNode {
  /** Unique identifier for the node */
  id: string;
  /** Type of node (e.g., "table", "group", "note") */
  type: string;
  /** Position of the node on the canvas */
  position: Position;
  /** Data associated with the node */
  data: NodeData;
  /** Optional width in pixels */
  width?: number;
  /** Optional height in pixels */
  height?: number;
  /** Optional parent node ID for nested nodes */
  parentId?: string;
  /** Optional extent property for containment */
  extent?: string;
  /** Optional custom styling */
  style?: any;
}

/**
 * Represents an edge (connection) between two nodes in a board template
 */
export interface BoardEdge {
  /** Unique identifier for the edge */
  id: string;
  /** ID of the source node */
  source: string;
  /** ID of the target node */
  target: string;
  /** Optional handle on the source node */
  sourceHandle?: string;
  /** Optional handle on the target node */
  targetHandle?: string;
  /** Optional edge type (e.g., "relationship", "reference") */
  type?: string;
  /** Optional label text for the edge */
  label?: string;
  /** Optional additional data */
  data?: any;
  /** Optional custom styling */
  style?: any;
}

/**
 * Complete board template containing nodes and edges
 */
export interface BoardTemplate {
  /** Array of nodes in the board */
  nodes: BoardNode[];
  /** Array of edges connecting nodes */
  edges: BoardEdge[];
}

/**
 * Draw.io Types
 */

/**
 * Style properties for Draw.io cells, supporting various visual attributes
 */
export interface DrawioStyle {
  /** Style properties as key-value pairs (e.g., fillColor, strokeColor, fontSize) */
  [key: string]: string | number;
}

/**
 * Represents a cell in the Draw.io diagram format (can be a vertex, edge, or group)
 */
export interface DrawioCell {
  /** Unique identifier for the cell */
  id: string;
  /** Optional HTML or text value displayed in the cell */
  value?: string;
  /** Optional semicolon-separated style string */
  style?: string;
  /** Whether this is a vertex (node). '1' = true, '0' = false */
  vertex?: '1' | '0';
  /** Whether this is an edge (connection). '1' = true, '0' = false */
  edge?: '1' | '0';
  /** Whether connections to this cell are allowed. '1' = true, '0' = false */
  connectable?: '1' | '0';
  /** Whether this cell can be moved. '1' = true, '0' = false */
  movable?: '1' | '0';
  /** ID of the parent cell */
  parent?: string;
  /** For edges: ID of the source cell */
  source?: string;
  /** For edges: ID of the target cell */
  target?: string;
  /** X coordinate relative to parent */
  x?: number;
  /** Y coordinate relative to parent */
  y?: number;
  /** Width of the cell in pixels */
  width?: number;
  /** Height of the cell in pixels */
  height?: number;
  /** Whether the cell is collapsed. '1' = collapsed, '0' = expanded */
  collapsed?: '1' | '0';
  /** Alternative bounds when collapsed */
  alternateBounds?: {
    /** Width when collapsed */
    width: number;
    /** Height when collapsed */
    height: number;
  };
  /** Optional tooltip text */
  tooltip?: string;
}

/**
 * Configuration options for converting board templates to Draw.io diagrams
 */
export interface ConversionOptions {
  /** Whether to include read-only fields in tables (default: true) */
  includeReadOnlyFields?: boolean;
  /** Whether to include group zones from the board (default: true) */
  includeGroupZones?: boolean;
  /** Title for the diagram (default: "SF Explorer Board") */
  title?: string;
  /** Whether to show field data types (default: true) */
  showFieldTypes?: boolean;
  /** Whether to show field descriptions as tooltips (default: false) */
  showDescriptions?: boolean;
  /** Width of table cells in pixels (default: 200) */
  tableWidth?: number;
  /** Height of field rows in pixels (default: 26) */
  fieldHeight?: number;
  /** Maximum number of fields to display per table (default: 20) */
  maxFields?: number;
  /** Whether tables should be collapsed by default (default: true) */
  collapseTables?: boolean;
  /** Whether to highlight Salesforce custom fields ending with __c (default: false) */
  highlightCustomFields?: boolean;
  /** Whether to show only custom fields ending with __c (default: false) */
  customFieldsOnly?: boolean;
  /** Custom style for primary key fields */
  primaryKeyStyle?: DrawioStyle;
  /** Custom style for foreign key fields */
  foreignKeyStyle?: DrawioStyle;
  
  /** Diagram style: 'erd' for Entity-Relationship Diagram, 'uml' for UML Class Diagram (default: 'erd') */
  diagramStyle?: 'erd' | 'uml';
  
  /** UML-specific options (only applies when diagramStyle='uml') */
  umlOptions?: {
    /** Whether to show visibility markers: + (public), - (private) (default: true) */
    showVisibilityMarkers?: boolean;
    /** Whether to group fields by visibility (default: false) */
    groupByVisibility?: boolean;
    /** Relationship style: 'association' for simple lines, 'smart' to infer from type (default: 'smart') */
    relationshipStyle?: 'association' | 'smart';
  };
}



