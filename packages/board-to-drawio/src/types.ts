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
  annotation?: string; // Optional annotation badge (e.g., "20k" for record limits)
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
  connectable?: '1' | '0'; // For group cells, prevents connections to the group itself
  movable?: '1' | '0'; // For field cells, prevents moving them
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
  description?: string; // Description (formerly tooltip)
  link?: string; // Clickable link URL (draw.io native link support)
  linkTarget?: string; // Link target: '_blank' to open in new window, '_self' for same window
  // Metadata attributes (for root cell)
  author?: string;
  title?: string;
  // Table properties
  KeyPrefix?: string;
  InternalSharingModel?: string;
  category?: string;
  APIName?: string;
  // Field properties
  label?: string;
  [key: string]: string | number | { width: number; height: number } | undefined; // Allow custom metadata attributes
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
  customFieldsOnly?: boolean; // Show only custom fields (ending with __c) (default: false)
  highlightCustomFields?: boolean; // Highlight Salesforce custom fields (ending with __c) (default: false)
  primaryKeyStyle?: DrawioStyle;
  foreignKeyStyle?: DrawioStyle;
  
  // Diagram style options
  diagramStyle?: 'erd' | 'uml'; // Default: 'erd'
  
  // UML-specific options (only applies when diagramStyle='uml')
  umlOptions?: {
    showVisibilityMarkers?: boolean; // Default: true (+ for public, - for private)
    groupByVisibility?: boolean; // Default: false (group PK, normal fields, FK)
    relationshipStyle?: 'association' | 'smart'; // Default: 'smart' (infer from relationship type)
  };
  
  // Diagram metadata and properties
  metadata?: {
    author?: string; // Author name
    description?: string; // Diagram description
    version?: string; // Version number
    created?: Date | string; // Creation date (defaults to current date)
    [key: string]: string | Date | undefined; // Additional custom properties
  };
  
  // Page settings
  pageSettings?: {
    size?: 'A4' | 'Letter' | 'Legal' | 'Tabloid' | 'Custom'; // Page size (default: 'A4')
    width?: number; // Custom width in pixels (only used when size='Custom')
    height?: number; // Custom height in pixels (only used when size='Custom')
    orientation?: 'portrait' | 'landscape'; // Page orientation (default: 'portrait')
  };
  
  // Viewport and zoom settings
  viewport?: {
    autoFit?: boolean; // Automatically fit content to viewport (default: false)
    initialZoom?: number; // Initial zoom level (0.1 to 4.0, default: 1.0)
    centerContent?: boolean; // Center content in viewport (default: true when autoFit is true)
  };
  
  // Title display options
  titleDisplay?: {
    show?: boolean; // Show title as visible text element on diagram (default: false)
    position?: 'top-left' | 'top-center' | 'top-right'; // Title position (default: 'top-center')
    fontSize?: number; // Title font size in pixels (default: 24)
    fontStyle?: 'normal' | 'bold' | 'italic'; // Title font style (default: 'bold')
    color?: string; // Title text color (default: '#000000')
  };
}



