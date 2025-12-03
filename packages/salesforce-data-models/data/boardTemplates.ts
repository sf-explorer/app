// ERD Data structure
export interface ERDData {
  nodes: any[] // Could be further typed based on your node structure
  edges: any[] // Could be further typed based on your edge structure
}

// Lazy loading interface for board templates
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

// Helper to create lazy loader with type safety
const createLazyLoader = (importFn: () => Promise<{ default: ERDData }>) => {
  return (): Promise<ERDData> => importFn().then(module => module.default)
}

export const erdModels: ERDModel[] = [
  {
    value: "custom",
    label: "Previously saved ERD",
    content: async () => ({ nodes: [], edges: [] }),
    description: "Load a previously saved Entity Relationship Diagram",
    icon: 'standard:custom',
    category: 'custom',
    complexity: 'beginner'
  },

  // Core Salesforce Clouds
  {
    value: "serviceCloud",
    label: "Service Cloud",
    content: createLazyLoader(() => import('./serviceCloud.json')),
    icon: 'custom:custom1',
    description: "Complete Service Cloud data model covering cases, entitlements, knowledge articles, and customer service workflows",
    category: 'service-cloud',
    complexity: 'intermediate',
    featured: true,
    tags: ['service', 'support', 'cases', 'knowledge', 'entitlements']
  },
  {
    value: "salescloud",
    label: "Sales Cloud",
    content: createLazyLoader(() => import('./salescloud.json')),
    icon: 'standard:opportunity',
    description: "Complete Sales Cloud data model covering leads, opportunities, accounts, contacts, and sales processes",
    category: 'sales-cloud',
    complexity: 'intermediate',
    featured: true,
    tags: ['sales', 'leads', 'opportunities', 'accounts', 'contacts', 'forecasting']
  },
  {
    value: "datacloud",
    label: "SSOT Model",
    content: createLazyLoader(() => import('./datacloud.json')),
    icon: 'standard:data_cloud',
    description: "Data Cloud Single Source of Truth model showing unified customer profiles and data integration patterns",
    category: 'data-cloud',
    complexity: 'advanced',
    tags: ['data-cloud', 'cdp', 'unified-profile', 'integration', 'ssot']
  },

  // Revenue Cloud Advanced (RCA)
  {
    value: "cpq",
    label: "Product Catalog",
    category: 'revenue-cloud',
    content: createLazyLoader(() => import('./productCatalog.json')),
    icon: 'standard:product',
    description: "Revenue Cloud Advanced product catalog structure including products, price books, quotes, and billing relationships",
    complexity: 'advanced',
    featured: false,
    tags: ['cpq', 'products', 'pricing', 'quotes', 'revenue']
  },
  {
    value: "billingAccounting",
    category: 'revenue-cloud',
    label: "Invoicing Data Model",
    content: createLazyLoader(() => import('./billingAccounting.json')),
    icon: 'standard:partner_fund_allocation',
    description: "Revenue Cloud Advanced invoicing and billing data model with payment processing and accounting workflows",
    complexity: 'advanced',
    featured: false,
    tags: ['billing', 'invoicing', 'payments', 'accounting', 'revenue']
  },

  // Financial Services Cloud (FSC)
  {
    value: "insurancePolicy",
    label: "Insurance Data Model",
    content: createLazyLoader(() => import('./insurancePolicy.json')),
    icon: 'standard:entitlement_policy',
    description: "Financial Services Cloud insurance policy management including claims, policies, and customer relationships",
    category: 'financial-services',
    complexity: 'advanced',
    featured: false,
    tags: ['fsc', 'insurance', 'policies', 'claims', 'underwriting']
  },
  {
    value: "kyc",
    label: "Know Your Customer",
    content: createLazyLoader(() => import('./kyc.json')),
    icon: 'custom:custom101',
    description: "Financial Services Cloud KYC compliance data model for customer verification and risk assessment",
    category: 'financial-services',
    complexity: 'advanced',
    featured: false,
    tags: ['fsc', 'kyc', 'compliance', 'verification', 'risk-assessment']
  },

  // Field Service Lightning (FSL)
  {
    value: "fieldService",
    label: "FSL Core Data Model",
    content: createLazyLoader(() => import('./fieldService.json')),
    icon: 'standard:fulfillment_order',
    description: "Field Service Lightning core entities including work orders, service appointments, and resource management",
    category: 'field-service',
    complexity: 'intermediate',
    featured: false,
    tags: ['fsl', 'work-orders', 'scheduling', 'mobile', 'resources']
  },

  // Industry Clouds
  {
    value: "euc",
    label: "EUC Core Data Model",
    content: createLazyLoader(() => import('./euc.json')),
    icon: 'standard:feed',
    description: "Energy & Utilities Cloud data model for utility companies including meters, usage, and billing cycles",
    category: 'industry-clouds',
    complexity: 'advanced',
    featured: false,
    tags: ['euc', 'utilities', 'meters', 'billing', 'energy']
  },

  // Platform & Security
  {
    value: "shield",
    label: "Real Time Event Monitoring",
    content: createLazyLoader(() => import('./shield.json')),
    icon: 'custom:custom73',
    description: "Platform Event Monitor shield events for security monitoring and compliance tracking with 40+ available events",
    category: 'platform-security',
    complexity: 'advanced',
    featured: true,
    tags: ['shield', 'security', 'monitoring', 'events', 'compliance']
  },
  {
    value: "security",
    label: "Security Model",
    content: createLazyLoader(() => import('./security.json')),
    icon: 'standard:user_role',
    description: "Comprehensive security data model covering users, profiles, permission sets, roles, and sharing rules",
    category: 'platform-security',
    complexity: 'advanced',
    featured: false,
    tags: ['security', 'permissions', 'profiles', 'roles', 'sharing', 'access-control']
  },
  {
    value: "businessRuleEngine",
    label: "Business Rule Engine",
    content: createLazyLoader(() => import('./businessRuleEngine.json')),
    icon: 'standard:work_plan_rule',
    description: "Business Rules Engine data model for automated decision-making and workflow automation",
    category: 'platform-automation',
    complexity: 'intermediate',
    featured: false,
    tags: ['rules-engine', 'automation', 'decisions', 'workflows']
  },

  // AI & Analytics
  {
    value: "agentForce",
    label: "Agentforce",
    content: createLazyLoader(() => import('./agentForce.json')),
    icon: 'standard:bot',
    description: "Agentforce AI agent data model including topics, intents, and conversation flows",
    category: 'agentforce',
    complexity: 'intermediate',
    featured: true,
    tags: ['agentforce', 'ai', 'chatbots', 'conversations', 'nlp']
  },
  {
    value: "agentfeedback",
    label: "Agentforce Feedback",
    content: createLazyLoader(() => import('./agentfeedback.json')),
    category: 'agentforce',
    icon: 'standard:bot',
    description: "Agentforce feedback and audit data model for AI performance monitoring and improvement",
    complexity: 'advanced',
    featured: false,
    tags: ['agentforce', 'feedback', 'analytics', 'performance', 'ai-monitoring']
  },
  {
    value: "discoveryFramework",
    label: "Discovery Framework",
    content: createLazyLoader(() => import('./discoveryFramework.json')),
    category: 'discovery-framework',
    icon: 'standard:learner_program',
    description: "Discovery Framework assessment and discovery framework objects",
    complexity: 'advanced',
    featured: false,
    tags: ['discovery-framework', 'assessment', 'discovery', 'framework']
  },
  {
    value: "actionPlan",
    label: "Action Plan",
    content: createLazyLoader(() => import('./actionPlan.json')),
    category: 'action-plan',
    icon: 'standard:hierarchy',
    description: "Action Plan data model including action plans, templates, and items",
    complexity: 'advanced',
    featured: false,
    tags: ['action-plan', 'action-plans', 'action-plan-templates', 'action-plan-items']
  }
]



// Helper functions for filtering and categorization
export const getERDsByCategory = (category: string): ERDModel[] => {
  return erdModels.filter(model => model.category === category)
}

export const getFeaturedERDs = (): ERDModel[] => {
  return erdModels.filter(model => model.featured === true)
}

export const getERDsByComplexity = (complexity: 'beginner' | 'intermediate' | 'advanced'): ERDModel[] => {
  return erdModels.filter(model => model.complexity === complexity)
}

export const getERDsByIndustry = (industry: string): ERDModel[] => {
  return erdModels.filter(model => model.category === industry)
}

export const searchERDs = (query: string): ERDModel[] => {
  const lowercaseQuery = query.toLowerCase()
  return erdModels.filter(model => 
    model.label.toLowerCase().includes(lowercaseQuery) ||
    model.description.toLowerCase().includes(lowercaseQuery) ||
    model.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// Category definitions for UI
export const erdCategories = {
  'service-cloud': {
    name: 'Service Cloud',
    description: 'Customer service and support workflows',
    color: '#0066ff'
  },
  'sales-cloud': {
    name: 'Sales Cloud',
    description: 'Sales processes, leads, opportunities, and customer management',
    color: '#00bcd4',
    icon: 'standard:opportunity'
  },
  'data-cloud': {
    name: 'Data Cloud',
    description: 'Single Source of Truth and unified customer profiles',
    color: '#4caf50'
  },
  'revenue-cloud': {
    name: 'Revenue Cloud Advanced',
    description: 'CPQ, billing, and revenue management',
    color: '#00c851'
  },
  'financial-services': {
    name: 'Financial Services Cloud',
    description: 'Banking, insurance, and financial industry models',
    color: '#ff6b35'
  },
  'field-service': {
    name: 'Field Service Lightning',
    description: 'Mobile workforce and service management',
    color: '#9c27b0'
  },
  'industry-clouds': {
    name: 'Industry-Specific Clouds',
    description: 'Specialized models for specific industries',
    color: '#ff9800'
  },
  'platform-security': {
    name: 'Platform & Security',
    description: 'Security monitoring and platform events',
    color: '#f44336'
  },
  'platform-automation': {
    name: 'Platform Automation',
    description: 'Rules engines and automation frameworks',
    color: '#795548'
  },
  'agentforce': {
    name: 'Agentforce',
    description: 'AI agents and conversation flows',
    color: '#e91e63'
  },
  'custom': {
    name: 'Custom Models',
    description: 'User-defined and saved models',
    color: '#607d8b'
  }
}