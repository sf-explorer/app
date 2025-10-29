# DrawDB Custom Types for Salesforce

## Overview

The transformation now includes **custom Salesforce types** that provide better semantic meaning and database-specific handling when exporting from drawDB.

## Custom Types Included

### 1. LOOKUP Type
**Purpose**: Represents Salesforce Lookup and Master-Detail relationships (foreign keys)

**Structure:**
```json
{
  "name": "LOOKUP",
  "fields": [
    {
      "name": "Id",
      "type": "TEXT",
      "size": 18
    }
  ],
  "comment": "Salesforce Lookup Relationship (Foreign Key)"
}
```

**Usage**: Automatically applied to:
- Fields with `x-target` metadata (indicates lookup relationship)
- Fields ending with `Id` (except the primary key `Id` field itself)

**Examples:**
- `AccountId` → `LOOKUP`
- `ContactId` → `LOOKUP`
- `Pricebook2Id` → `LOOKUP`
- `RecordTypeId` → `LOOKUP`

### 2. CURRENCY Type
**Purpose**: Represents Salesforce Currency fields with multi-currency support

**Structure:**
```json
{
  "name": "CURRENCY",
  "fields": [
    {
      "name": "amount",
      "type": "DECIMAL",
      "size": 18
    },
    {
      "name": "currency_code",
      "type": "TEXT",
      "size": 3
    }
  ],
  "comment": "Salesforce Currency with ISO code"
}
```

**When Exported:**
- **PostgreSQL**: Creates a composite type with amount and currency_code
- **MySQL**: Creates JSON type with validation
- **SQLite**: Maps to BLOB
- **MSSQL**: Creates type alias

### 3. PERCENT Type
**Purpose**: Represents Salesforce Percentage fields

**Structure:**
```json
{
  "name": "PERCENT",
  "fields": [
    {
      "name": "value",
      "type": "DECIMAL"
    }
  ],
  "comment": "Salesforce Percentage field"
}
```

## Benefits

### 1. **Semantic Clarity**
Instead of generic `VARCHAR(255)` for all foreign keys, we use `LOOKUP` which:
- Clearly indicates this is a relationship field
- Shows it's a Salesforce-style 18-character ID
- Helps developers understand the schema intent

### 2. **Database Export Flexibility**
When exporting to different databases from drawDB:
- **PostgreSQL**: LOOKUP becomes a proper composite type
- **MySQL**: Uses JSON with validation
- **Others**: Appropriately mapped

### 3. **Visual Distinction**
In drawDB's UI, custom types are displayed differently, making it easy to spot:
- Relationship fields (LOOKUP)
- Special Salesforce types (CURRENCY, PERCENT)
- Standard fields (VARCHAR, INTEGER, etc.)

## Example Output

### Salescloud Board - Opportunity Table

```json
{
  "name": "Opportunity",
  "fields": [
    {
      "name": "Id",
      "type": "TEXT",
      "primary": true
    },
    {
      "name": "AccountId",
      "type": "LOOKUP",
      "comment": "Account ID"
    },
    {
      "name": "RecordTypeId",
      "type": "LOOKUP",
      "comment": "Type of record"
    },
    {
      "name": "CampaignId",
      "type": "LOOKUP",
      "comment": "Campaign ID"
    },
    {
      "name": "Pricebook2Id",
      "type": "LOOKUP",
      "comment": "Price Book ID"
    },
    {
      "name": "Name",
      "type": "VARCHAR(255)",
      "comment": "Opportunity name"
    },
    {
      "name": "Amount",
      "type": "NUMERIC",
      "comment": "Opportunity amount"
    }
  ]
}
```

### All Boards Include Custom Types

Every generated board now includes the `types` array:

```json
{
  "title": "SF Explorer Board",
  "database": "generic",
  "tables": [...],
  "relationships": [...],
  "types": [
    {
      "name": "LOOKUP",
      "fields": [...]
    },
    {
      "name": "CURRENCY",
      "fields": [...]
    },
    {
      "name": "PERCENT",
      "fields": [...]
    }
  ]
}
```

## Field Type Detection Logic

The transformation uses smart detection:

```typescript
// Check if this is a lookup/foreign key field
const isLookup = 
  prop['x-target'] !== undefined ||  // Has explicit target metadata
  (name.endsWith('Id') && name !== 'Id');  // Ends with Id but not primary key

const sqlType = isLookup ? 'LOOKUP' : mapTypeToSQL(prop.type, prop.format);
```

## Statistics

Across all boards:
- **LOOKUP fields**: Hundreds of foreign key fields now properly typed
- **Standard fields**: VARCHAR, INTEGER, TIMESTAMP, etc. remain as-is
- **Custom types**: 3 Salesforce-specific types included

## Database-Specific Exports

When you export from drawDB to SQL:

### PostgreSQL
```sql
CREATE TYPE LOOKUP AS (
    Id TEXT(18)
);

CREATE TABLE Opportunity (
    Id TEXT PRIMARY KEY,
    AccountId LOOKUP,
    Name VARCHAR(255)
);
```

### MySQL
```sql
-- LOOKUP becomes JSON with validation
CREATE TABLE Opportunity (
    Id TEXT PRIMARY KEY,
    AccountId JSON,
    Name VARCHAR(255),
    CONSTRAINT check_AccountId CHECK (
        JSON_TYPE(AccountId) = 'OBJECT'
    )
);
```

### Generic/SQLite
```sql
CREATE TABLE Opportunity (
    Id TEXT PRIMARY KEY,
    AccountId TEXT,  -- Flattened to base type
    Name VARCHAR(255)
);
```

## Future Enhancements

Potential additional custom types:
- `EMAIL` - Salesforce Email fields with validation
- `PHONE` - Phone number fields with formatting
- `URL` - URL fields with validation
- `PICKLIST` - Enumerated values
- `MULTI_PICKLIST` - Multi-select picklists
- `GEOLOCATION` - Lat/Long composite type
- `ENCRYPTED` - Encrypted text fields

## Compatibility

✅ **Fully compatible** with drawDB import/export  
✅ **Matches** the format of manually created drawDB diagrams  
✅ **Preserves** all relationship information  
✅ **Enhances** semantic meaning without breaking functionality  

All files generated with custom types can be imported directly into drawDB!

