# @sf-explorer/salesforce-data-models

Comprehensive Salesforce data models and Entity Relationship Diagram (ERD) templates covering Sales Cloud, Service Cloud, Revenue Cloud, Field Service, Financial Services Cloud, and more.

> **Note**: In the monorepo, this package references data files from the root `Boards/` directory. When published to npm, data files are automatically copied into the package during the publish process.

## Installation

```bash
npm install @sf-explorer/salesforce-data-models
```

## Features

- 🏢 **17+ Pre-built Data Models** covering major Salesforce clouds and products
- 📊 **Standardized ERD Format** with nodes and edges for easy visualization
- 🎯 **Categorized & Tagged** for easy discovery and filtering
- 🔍 **Search & Filter APIs** built-in
- 📦 **Tree-shakeable** ESM modules with TypeScript support
- 🚀 **Lazy Loading** for optimal performance

## Available Models

### Core Clouds
- **Service Cloud** - Cases, entitlements, knowledge articles, and customer service workflows
- **Sales Cloud** - Leads, opportunities, accounts, contacts, and sales processes
- **Data Cloud** - Single Source of Truth with unified customer profiles

### Revenue Cloud Advanced
- **Product Catalog** - Products, price books, quotes, and billing relationships
- **Invoicing Data Model** - Billing, invoicing, payments, and accounting workflows

### Financial Services Cloud
- **Insurance Data Model** - Policy management, claims, and customer relationships
- **Know Your Customer (KYC)** - Compliance, verification, and risk assessment

### Field Service
- **FSL Core Data Model** - Work orders, service appointments, and resource management

### Industry Clouds
- **Energy & Utilities Cloud** - Meters, usage tracking, and billing cycles

### Platform & Security
- **Real Time Event Monitoring** - Shield events for security monitoring (40+ events)
- **Security Model** - Users, profiles, permission sets, roles, and sharing rules
- **Business Rule Engine** - Automated decision-making and workflow automation

### AI & Analytics
- **Agentforce** - AI agent topics, intents, and conversation flows
- **Agentforce Feedback** - AI performance monitoring and improvement
- **Agent Interactions** - Conversation tracking and management
- **Discovery Framework** - Assessment and discovery tools
- **Action Plans** - Action plan management and templates

## Usage

### Basic Usage

```typescript
import { erdModels, ERDData } from '@sf-explorer/salesforce-data-models'

// Load a specific model
const serviceCloudModel = erdModels.find(m => m.value === 'serviceCloud')
const data: ERDData = await serviceCloudModel.content()

console.log(`Loaded ${data.nodes.length} nodes and ${data.edges.length} edges`)
```

### Using Filter Functions

```typescript
import { 
  getFeaturedERDs, 
  getERDsByCategory, 
  getERDsByComplexity,
  searchERDs 
} from '@sf-explorer/salesforce-data-models'

// Get featured models
const featured = getFeaturedERDs()

// Get models by category
const serviceClouds = getERDsByCategory('service-cloud')

// Get models by complexity
const beginnerModels = getERDsByComplexity('beginner')

// Search models
const agentModels = searchERDs('agent')
```

### Working with Categories

```typescript
import { erdCategories } from '@sf-explorer/salesforce-data-models'

// Display category information
Object.entries(erdCategories).forEach(([key, category]) => {
  console.log(`${category.name}: ${category.description}`)
})
```

### TypeScript Support

```typescript
import type { 
  ERDData, 
  ERDNode, 
  ERDEdge, 
  ERDModel,
  ERDCategory 
} from '@sf-explorer/salesforce-data-models'

// All types are fully documented
function processERD(data: ERDData) {
  data.nodes.forEach((node: ERDNode) => {
    console.log(`Node ${node.id} at position (${node.position?.x}, ${node.position?.y})`)
  })
}
```

## Data Structure

Each ERD model contains:

```typescript
interface ERDData {
  nodes: ERDNode[]  // Entities/Objects in the model
  edges: ERDEdge[]  // Relationships between entities
}

interface ERDNode {
  id: string
  type?: string
  position?: { x: number; y: number }
  data?: any
}

interface ERDEdge {
  id: string
  source: string
  target: string
  type?: string
  data?: any
}
```

## Model Metadata

Each model includes rich metadata:

```typescript
interface ERDModel {
  value: string          // Unique identifier
  label: string          // Display name
  description: string    // Detailed description
  icon: string          // Salesforce Lightning icon name
  category: string      // Category for grouping
  complexity: 'beginner' | 'intermediate' | 'advanced'
  featured: boolean     // Whether to highlight in UI
  tags: string[]        // Searchable tags
  content: () => Promise<ERDData>  // Lazy-loaded data
}
```

## Use Cases

- 📐 **ERD Visualization** - Build interactive entity relationship diagrams
- 📚 **Documentation** - Generate Salesforce data model documentation
- 🎓 **Training** - Educational materials for Salesforce architecture
- 🔄 **Schema Migration** - Plan and document data migrations
- 🏗️ **Solution Architecture** - Design and present Salesforce solutions
- 🔍 **Discovery** - Explore and understand Salesforce data structures

## Integration Examples

### With React Flow

```typescript
import { erdModels } from '@sf-explorer/salesforce-data-models'
import ReactFlow from 'reactflow'

function MyDiagram() {
  const [elements, setElements] = useState({ nodes: [], edges: [] })
  
  useEffect(() => {
    const loadModel = async () => {
      const model = erdModels.find(m => m.value === 'salescloud')
      const data = await model.content()
      setElements(data)
    }
    loadModel()
  }, [])
  
  return <ReactFlow nodes={elements.nodes} edges={elements.edges} />
}
```

### With Draw.io/DrawDB Converters

```typescript
import { erdModels } from '@sf-explorer/salesforce-data-models'
import { boardToDrawio } from '@sf-explorer/board-to-drawio'
import { boardToDrawDB } from '@sf-explorer/board-to-drawdb'

// Convert to Draw.io format
const model = erdModels.find(m => m.value === 'serviceCloud')
const data = await model.content()
const drawioXml = boardToDrawio(data)

// Convert to DrawDB format
const drawdbJson = boardToDrawDB(data)
```

## Related Packages

- [@sf-explorer/board-to-drawio](https://www.npmjs.com/package/@sf-explorer/board-to-drawio) - Convert models to Draw.io format
- [@sf-explorer/board-to-drawdb](https://www.npmjs.com/package/@sf-explorer/board-to-drawdb) - Convert models to DrawDB format

## License

MIT

## Contributing

Issues and pull requests are welcome! Visit our [GitHub repository](https://github.com/sf-explorer/app).

## Support

For questions and support, please [open an issue](https://github.com/sf-explorer/app/issues) on GitHub.

