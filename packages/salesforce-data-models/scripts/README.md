# Data Model Scripts

This directory contains utility scripts for maintaining and optimizing the Salesforce data model JSON files.

## Scripts

### `slice-enums.cjs`

Slices large `enum` and `enumNames` arrays to a maximum of 30 values to reduce file size.

**Usage:**
```bash
node scripts/slice-enums.cjs <input-file> [output-file]
```

**Example:**
```bash
# Slice enums in security.json (overwrites the file)
node scripts/slice-enums.cjs data/security.json

# Slice enums and save to a different file
node scripts/slice-enums.cjs data/security.json data/security-optimized.json
```

### `slice-all-enums.cjs`

Batch processes all JSON files in the `data/` directory to slice large enums.

**Usage:**
```bash
node scripts/slice-all-enums.cjs

# Or via npm script
npm run slice-enums
```

## Why Slice Enums?

Some Salesforce fields have hundreds of possible values (e.g., TimeZone has 425 options, Language has 217 options, SobjectType has 2,803 options). Including all these values in the JSON schemas significantly increases file size.

By limiting enums to 30 values:
- **Reduces file size** by 30-75% depending on the data model
- **Improves load times** for applications consuming these schemas
- **Maintains usability** - 30 values is typically sufficient for UI dropdowns and validation

### Size Reduction Examples

| File | Original Size | New Size | Reduction |
|------|--------------|----------|-----------|
| salescloud.json | 0.45 MB | 0.15 MB | 66.58% |
| agentForce.json | 0.23 MB | 0.06 MB | 74.57% |
| euc.json | 0.13 MB | 0.08 MB | 41.29% |
| security.json | 0.68 MB | 0.49 MB | 27.44% |
| **Total (all files)** | **4.52 MB** | **2.83 MB** | **37.44%** |

## When to Run

Run the enum slicing scripts:
- Before publishing a new version of the package
- After updating data models with new fields
- When optimizing for production use

**Note:** The first 30 values are kept, which usually includes the most common options. Applications can still query the full list of values from Salesforce APIs if needed.

