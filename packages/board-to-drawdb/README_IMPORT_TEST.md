# Import Test - Super Minimal File

## Test File
`test-super-minimal.json` - The absolute simplest possible test

## What It Contains
- **1 table**: Account
- **1 field**: Id (primary key)
- **0 relationships**: None
- **Format**: Matches working drawDB export exactly

## Structure
```json
{
  "tables": [             // ✓ First (correct order)
    {
      "id": 0,
      "name": "Account",
      "x": 400,
      "y": 300,
      "color": "#2196F3",
      "indices": [{...}],
      "comment": "Simple test",
      "fields": [
        {
          "name": "Id",         // ✓ name first
          "type": "VARCHAR(255)",
          "default": "",
          "check": "",
          "primary": true,
          "unique": true,
          "notNull": true,
          "increment": false,
          "comment": "Primary Key",
          "id": 0              // ✓ id last
        }
      ]
    }
  ],
  "relationships": [],
  "notes": [],
  "subjectAreas": [],
  "database": "generic",
  "types": [...],
  "title": "Super Minimal"    // ✓ Last (correct order)
}
```

## What's Been Fixed

### 1. Root Property Order
- ✅ `"tables"` first
- ✅ `"title"` last
- ✅ Matches working file exactly

### 2. Field Property Order  
- ✅ `"name"` first
- ✅ `"id"` last
- ✅ All required properties present

### 3. Table Property Order
- ✅ `"id"` first
- ✅ `"fields"` last
- ✅ All required properties present

## Test This File

1. Go to https://drawdb.vercel.app/
2. **Import** → **From JSON**
3. Select: `test-super-minimal.json`

If this works:
- Try `test-minimal-generated.json` (3 fields)
- Then try full boards from `output/` directory

If this still doesn't work, there might be:
- A version issue with drawDB
- A browser console error
- A different format requirement

## Next Steps if Still Failing

Check browser console for errors:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Try importing
4. Share any error messages

The file structure now matches the working export exactly!

