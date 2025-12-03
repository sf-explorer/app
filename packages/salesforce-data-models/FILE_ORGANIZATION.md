# File Organization

## Structure

All diagrams live **inside the package** - single source of truth:

```
packages/salesforce-data-models/
├── data/                    ← Single source of truth (18 files)
│   ├── actionPlan.json
│   ├── agentForce.json
│   ├── agentInteractions.json
│   ├── agentfeedback.json
│   ├── billingAccounting.json
│   ├── businessRuleEngine.json
│   ├── component.json
│   ├── datacloud.json
│   ├── discoveryFramework.json
│   ├── euc.json
│   ├── fieldService.json
│   ├── insurancePolicy.json
│   ├── kyc.json
│   ├── productCatalog.json
│   ├── salescloud.json
│   ├── security.json
│   ├── serviceCloud.json
│   ├── shield.json
│   └── boardTemplates.ts
├── src/
│   ├── index.ts            ← Imports from ../data/
│   └── types.ts
├── dist/                   ← Compiled output
├── package.json
├── README.md
└── LICENSE
```

## Benefits

✅ **Single Source** - One copy of each file  
✅ **Logical Ownership** - Data belongs in the package  
✅ **Self-Contained** - Package is complete and publishable  
✅ **No Duplication** - No copies anywhere  
✅ **Simple** - Straightforward structure  
✅ **Git-Friendly** - Data is versioned with the package  

## Workflow

### Adding New Data Models
1. Add JSON file to `packages/salesforce-data-models/data/`
2. Update `src/index.ts` to include in `erdModels` array
3. Rebuild: `npm run build`

### Updating Existing Models
1. Edit files in `packages/salesforce-data-models/data/`
2. Rebuild if needed: `npm run build`

### Publishing
```bash
cd packages/salesforce-data-models
npm publish
```

Data is included automatically - no special steps needed!
