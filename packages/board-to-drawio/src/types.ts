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
  method?: string;
  url?: string;
  body?: string;
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
  parentId?: string;
  extent?: string;
  style?: any;
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
  style?: any;
}

export interface BoardTemplate {
  nodes: BoardNode[];
  edges: BoardEdge[];
}

/**
 * Draw.io Types
 */

export interface DrawioStyle {
  [key: string]: string | number;
}

export interface DrawioCell {
  id: string;
  value?: string;
  style?: string;
  vertex?: '1' | '0';
  edge?: '1' | '0';
  parent?: string;
  source?: string;
  target?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  collapsed?: '1' | '0';
  alternateBounds?: {
    width: number;
    height: number;
  };
  tooltip?: string;
}

export interface ConversionOptions {
  includeReadOnlyFields?: boolean;
  includeGroupZones?: boolean;
  title?: string;
  showFieldTypes?: boolean;
  showDescriptions?: boolean;
  tableWidth?: number;
  fieldHeight?: number;
  maxFields?: number;
  collapseTables?: boolean; // Collapse tables by default (default: true)
  primaryKeyStyle?: DrawioStyle;
  foreignKeyStyle?: DrawioStyle;
}



