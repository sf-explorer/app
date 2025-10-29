# SF Explorer

Productivity tool for Salesforce admins and devs
Share or collaborate on Explorer resources:

## Diagrams

This repository provides templates exploring various Salesforce clouds and capabilities. Each template is self-contained and can be shared.

**Key Capabilities:**
- **Open and read diagrams** without needing to be connected to an org
- **View custom attributes** when opened in context to your org
- **Select a user** and analyze the associated security model
- **Add your own objects** and customize templates
- **Share your own specific templates** with others

These diagrams serve as comprehensive data models and relationship diagrams for different Salesforce use cases, helping you understand the object structure and relationships within each domain.

**Collaboration:** This repository is designed for collaboration - feel free to share concepts, contribute new diagrams, or suggest other Salesforce clouds not yet covered here.
| Board | Description | Objects | File | Open Board |
|-------|-------------|---------|------|------------|
| ☁️ Sales Cloud | Complete sales data model with leads, opportunities, and forecasting | 14 | [salescloud.json](./Boards/salescloud.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=salescloud) |
| ☁️ Service Cloud | From case to entitlements | 19 | [serviceCloud.json](./Boards/serviceCloud.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=serviceCloud) |
| 📦 RCA: Product Catalog | Product management and catalog systems | 14 | [productCatalog.json](./Boards/productCatalog.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=cpq) |
| 💰 RCA: Invoicing Data Model | Financial management and billing systems | 15 | [billingAccounting.json](./Boards/billingAccounting.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=billingAccounting) |
| 🛡️ FSC: Insurance Data Model | Insurance policy management | 22 | [insurancePolicy.json](./Boards/insurancePolicy.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=insurancePolicy) |
| 🔍 FSC: Know Your Customer | Customer verification and compliance | 9 | [kyc.json](./Boards/kyc.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=kyc) |
| 🔧 FSL: Core Data Model | Field service management and operations | 15 | [fieldService.json](./Boards/fieldService.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=fieldService) |
| ⚡ EUC: Core Data Model | Energy&Utility Cloud now on Core | 10 | [euc.json](./Boards/euc.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=euc) |
| 🔒 Shield: Available Events | Discover the 40 available event and examples of how to leverage them | 37 | [shield.json](./Boards/shield.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=shield) |
| 🔐 Security Model | Comprehensive security covering users, profiles, permissions, and roles | 19 | [security.json](./Boards/security.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=security) |
| ☁️ Data Cloud: SSOT Model | SSOT Data Model | 7 | [datacloud.json](./Boards/datacloud.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=datacloud) |
| ⚙️ Business Rule Engine | Business rule management | 13 | [businessRuleEngine.json](./Boards/businessRuleEngine.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=businessRuleEngine) |
| 🎯 Discovery Framework | Assessment and discovery framework for org analysis | 17 | [discoveryFramework.json](./Boards/discoveryFramework.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=discoveryFramework) |
| 📋 Action Plan | Action plan data model with templates and task management | 7 | [actionPlan.json](./Boards/actionPlan.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=actionPlan) |
| 🤖 Agentforce | Agent productivity and management tools | 14 | [agentForce.json](./Boards/agentForce.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=agentForce) |
| 🤖 Agentforce feedback | Understand and analyze your Einstein generative AI audit and feedback data | 13 | [agentfeedback.json](./Boards/agentfeedback.json) | [🔗 Open](https://app.sf-explorer.com/well-architected.html#sfe.erd?template=agentfeedback) |


### Packages

This repository includes utility packages for working with SF Explorer board templates:

#### [@sf-explorer/board-to-drawdb](./packages/board-to-drawdb)

Transform SF Explorer board templates into drawDB compatible format. This package allows you to:
- Convert board templates to drawDB schema format
- Export diagrams for use in other database design tools
- Customize conversion options (exclude read-only fields, target different databases, etc.)

```typescript
import { transformBoardToDrawDB } from '@sf-explorer/board-to-drawdb';
import boardTemplate from './Boards/salescloud.json';

const drawDBSchema = transformBoardToDrawDB(boardTemplate);
```

See the [package README](./packages/board-to-drawdb/README.md) for full documentation.

### Other Resources

* [Notebooks](./Notebooks/)
* [Custom Apps](./CustomApps/)
