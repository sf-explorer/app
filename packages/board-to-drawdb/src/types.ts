/**
 * Board Template Types
 */

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  label: string;
  content?: string;
  icon?: string;
  color?: string;
  Id?: string;
  table?: TableData;
  schema?: JSONSchema;
}

export interface TableData {
  name: string;
  label: string;
  description?: string;
  columns: any[];
}

export interface JSONSchema {
  type: string;
  description?: string;
  properties: {
    [key: string]: SchemaProperty;
  };
}

export interface SchemaProperty {
  type: string;
  title: string;
  description?: string;
  format?: string;
  readOnly?: boolean;
  enum?: any[];
  enumNames?: any[];
  'x-target'?: string;
  items?: any;
}

export interface BoardNode {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  width?: number;
  height?: number;
}

export interface BoardEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  label?: string;
  data?: any;
}

export interface BoardTemplate {
  nodes: BoardNode[];
  edges: BoardEdge[];
}

/**
 * DrawDB Types
 */

export interface DrawDBColumn {
  id: number;
  name: string;
  type: string;
  default: string;
  check: string;
  primary: boolean;
  unique: boolean;
  notNull: boolean;
  increment: boolean;
  comment: string;
}

export interface DrawDBTable {
  id: number;
  name: string;
  comment?: string;
  color: string;
  x: number;
  y: number;
  fields: DrawDBColumn[];
  indices?: DrawDBIndex[];
}

export interface DrawDBIndex {
  id: number;
  name: string;
  unique: boolean;
  fields: number[]; // Array of field IDs in the index
}

export interface DrawDBRelationship {
  id: number;
  name: string;
  startTableId: number;
  endTableId: number;
  startFieldId: number;
  endFieldId: number;
  cardinality: 'one_to_one' | 'one_to_many' | 'many_to_one' | 'many_to_many';
  updateConstraint: string;
  deleteConstraint: string;
}

export interface DrawDBNote {
  id: number;
  x: number;
  y: number;
  title: string;
  content: string;
  locked: boolean;
  color: string;
  height: number;
  width: number;
}

export interface DrawDBArea {
  id: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  locked: boolean;
}

export interface DrawDBType {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    size?: number;
  }>;
  comment: string;
}

export interface DrawDBSchema {
  title?: string;
  database?: 'generic' | 'postgresql' | 'mysql' | 'sqlite' | 'mssql';
  tables: DrawDBTable[];
  relationships: DrawDBRelationship[];
  notes?: DrawDBNote[];
  subjectAreas?: DrawDBArea[];
  types?: DrawDBType[];
}

/**
 * Mapping types for conversion
 */

export interface ConversionOptions {
  includeReadOnlyFields?: boolean;
  includeGroupZones?: boolean;
  defaultDatabase?: DrawDBSchema['database'];
  title?: string; // Custom title for the diagram
  onlyRelationshipFields?: boolean; // Only show Id and lookup fields for cleaner relationship view
}

