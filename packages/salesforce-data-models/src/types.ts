/**
 * Node in an Entity Relationship Diagram
 */
export interface ERDNode {
  id: string
  type?: string
  position?: {
    x: number
    y: number
  }
  data?: any
  [key: string]: any
}

/**
 * Edge/Relationship in an Entity Relationship Diagram
 */
export interface ERDEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: any
  [key: string]: any
}

/**
 * Complete ERD data structure with nodes and edges
 */
export interface ERDData {
  nodes: ERDNode[]
  edges: ERDEdge[]
}

/**
 * Metadata for an ERD model
 */
export interface ERDModel {
  value: string
  label: string
  content: () => Promise<ERDData>
  description: string
  icon: string
  category?: string
  complexity?: 'beginner' | 'intermediate' | 'advanced'
  featured?: boolean
  tags?: string[]
}

/**
 * Category information for organizing ERD models
 */
export interface ERDCategory {
  name: string
  description: string
  color: string
  icon?: string
}

/**
 * Map of category IDs to category information
 */
export type ERDCategoryMap = Record<string, ERDCategory>

