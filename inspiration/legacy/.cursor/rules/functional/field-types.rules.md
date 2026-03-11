# Field Types Rules
**CURSOR: RULES-FIELD-001 and RULES-FIELD-002**

## RULES-FIELD-001: Field Type Support (IN PROGRESS)
**Module:** `backend/src/features/field/`

### Purpose
Support diverse data types for column values with proper validation and formatting.

### Supported Field Types (20 Current + 13 Planned)

#### ✓ CURRENT TYPES
```
1. Text           → VARCHAR    → string
2. Number         → DECIMAL    → number
3. Checkbox       → BOOLEAN    → boolean
4. SingleSelect   → VARCHAR    → { id, label, color }
5. MultiSelect    → JSONB      → [{ id, label, color }]
6. Date           → DATE       → ISO 8601 string
7. DateTime       → TIMESTAMP  → ISO 8601 string
8. Email          → VARCHAR    → string (validated)
9. Phone          → VARCHAR    → string (formatted)
10. URL           → VARCHAR    → string (validated)
11. RichText      → TEXT       → HTML string
12. Attachment    → JSONB      → [{ id, name, url, size }]
13. Barcode       → VARCHAR    → string
14. QR Code       → VARCHAR    → string
15. Duration      → INTEGER    → milliseconds
16. Rating        → INTEGER    → 1-5
17. Currency      → DECIMAL    → number + symbol
18. Percentage    → DECIMAL    → 0-100
19. Formula       → (dynamic)  → calculated value
20. Lookup        → (dynamic)  → joined field values
```

#### ✗ PLANNED TYPES (NEW)
```
21. Link          → JSONB      → Record references
22. Rollup        → (dynamic)  → Aggregated values
23. Count         → INTEGER    → Reference count
24. Geometry      → JSONB      → GeoJSON
25. JSON          → JSONB      → Raw JSON
26. Markdown      → TEXT       → Markdown content
27. Button        → VARCHAR    → Action trigger
28. AI Field      → TEXT       → AI-generated
29. AutoNumber    → BIGINT     → Sequence
30. CreatedBy     → VARCHAR    → User ID
31. CreatedTime   → TIMESTAMP  → Auto timestamp
32. UpdatedBy     → VARCHAR    → User ID
33. UpdatedTime   → TIMESTAMP  → Auto timestamp
```

### Implementation Pattern
```typescript
// backend/src/features/field/field.controller.ts
// CURSOR: RULES-FIELD-001 - Field Type Support

@Controller('fields')
export class FieldController {
  @Post()
  async create(@Body() dto: CreateFieldDTO) {
    // 1. Validate field type is supported
    // 2. Validate type-specific options
    // 3. Map to DB column type
    // 4. Create Field record
    // 5. Broadcast via WebSocket
  }

  @Patch(':fieldId')
  async update(@Param('fieldId') id: string, @Body() dto: UpdateFieldDTO) {
    // 1. Check type change compatibility
    // 2. Perform data migration if needed
    // 3. Update Field metadata
  }
}
```

### Field Configuration

#### Base Field Properties
```typescript
interface Field {
  id: string;
  tableId: string;
  name: string;                    // "Email", "Company Name"
  type: FieldType;                 // "email", "text", etc.
  description?: string;
  position: number;                // Column order
  required: boolean;
  unique: boolean;
  defaultValue?: any;
  
  // Type-specific options (JSONB)
  options: {
    // For SingleSelect/MultiSelect
    choices?: { id, label, color }[];
    
    // For Number, Currency, Percentage
    precision?: number;
    decimal?: number;
    prefix?: string;
    suffix?: string;
    
    // For Date/DateTime
    includeTime?: boolean;
    format?: string; // "YYYY-MM-DD"
    
    // For Rating
    maxValue?: number;
    
    // For Link (planned)
    linkedTableId?: string;
    linkedFieldId?: string;
    
    // For Formula (planned)
    expression?: string;
    resultType?: FieldType;
  };
  
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema
```prisma
model Field {
  id              String   @id @default(cuid())
  tableId         String
  table           TableMeta @relation(fields: [tableId], references: [id])
  
  name            String
  type            String   // e.g., "text", "number", "email"
  description     String?
  position        Int      // Column order
  
  required        Boolean  @default(false)
  unique          Boolean  @default(false)
  defaultValue    Json?    // Default value per type
  
  options         Json     @default("{}")  // Type-specific config
  status          String   @default("active")
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([tableId])
  @@unique([tableId, position])
}
```

### Validation Rules
```typescript
// Text/RichText
maxLength: 1000000

// Number
minValue: -999999999
maxValue: 999999999
decimals: 0-15

// Email
pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Phone
pattern: /^[\d\s\-\+\(\)]+$/

// URL
pattern: /^https?:\/\/.+/

// Date
minDate: 1900-01-01
maxDate: 2100-12-31

// Currency
precision: 2-15 decimals
symbol: required

// Rating
minValue: 1
maxValue: 10
```

### Type Conversion Matrix
```typescript
// When changing field type
Text ──→ Number (parse numbers only)
     ──→ Email (validate email format)
     ──→ URL (validate URL format)

Number ─→ Text (stringify)
       ─→ Currency (add currency)
       ─→ Percentage (ensure 0-100)

Date ──→ DateTime (add time)
     ──→ Text (format as string)

Checkbox → SingleSelect (true→checked, false→unchecked)
```

---

## RULES-FIELD-002: Field Options & Metadata (COMPLETE)
**Module:** `backend/src/features/field/DTO/`

### Purpose
Store and manage field-specific configurations and validation rules.

### Metadata Structure
```typescript
// Options stored in Field.options JSON
{
  // Display & Formatting
  "displayFormat": "phone" | "currency" | "percentage",
  "color": "#FF5733",           // UI color
  "hidden": false,              // Hidden from view
  "searchable": true,           // Indexed for search
  
  // Validation
  "validate": {
    "required": true,
    "unique": false,
    "minLength": 1,
    "maxLength": 255,
    "pattern": "^[A-Z].*",
    "customRule": "function(value) { return value > 0; }"
  },
  
  // For SelectFields
  "choices": [
    { "id": "opt1", "label": "Option 1", "color": "#FF6B6B" },
    { "id": "opt2", "label": "Option 2", "color": "#4ECDC4" }
  ],
  
  // For Date/DateTime
  "dateFormat": "YYYY-MM-DD",
  "timeFormat": "HH:mm:ss",
  "includeTime": false,
  
  // For Number types
  "precision": 2,
  "prefix": "$",
  "suffix": " USD"
}
```

### API Endpoints
```
POST   /api/v1/fields
GET    /api/v1/tables/:tableId/fields
PATCH  /api/v1/fields/:fieldId
DELETE /api/v1/fields/:fieldId
POST   /api/v1/fields/:fieldId/options
```

### Implementation Pattern
```typescript
// CURSOR: RULES-FIELD-002 - Field Options & Metadata

export class FieldService {
  async updateOptions(
    fieldId: string,
    options: FieldOptions
  ): Promise<Field> {
    // 1. Validate options per field type
    // 2. Merge with existing options
    // 3. Update Field.options JSONB
    // 4. Emit 'field:optionsChanged' event
  }

  async getFieldConfig(fieldId: string): Promise<FieldConfig> {
    // Return complete field configuration
    // Include type mappings, validation rules
  }
}
```

### Type Mappings (DB → Cell Value)
```typescript
// Maps database type to cell value transformation
export const DB_TO_CELL_VALUE: Record<FieldType, Transformer> = {
  text: (val: string) => val || '',
  number: (val: number) => Number(val) || 0,
  email: (val: string) => val?.toLowerCase() || '',
  date: (val: Date) => val?.toISOString().split('T')[0] || '',
  checkbox: (val: boolean) => Boolean(val),
  singleSelect: (val: string, options) => {
    const choice = options.choices.find(c => c.id === val);
    return { id: val, label: choice?.label, color: choice?.color };
  },
  // ... more mappings
};
```

### WebSocket Events
```typescript
socket.emit('field:created', {
  tableId: string,
  field: Field
});

socket.emit('field:updated', {
  tableId: string,
  fieldId: string,
  changes: { name?, type?, options? }
});

socket.emit('field:deleted', {
  tableId: string,
  fieldId: string
});
```

---

## Common Patterns

### Adding New Field Type
1. Add type constant to `FieldType` enum
2. Add validation rules to `FIELD_VALIDATION`
3. Add DB mapping to `DB_TYPE_MAPPING`
4. Add cell value transformer
5. Create migration if DB structure needed
6. Add frontend component for options UI

### Field Format Configuration
```typescript
// Format applied when displaying/exporting
export const FIELD_FORMATS: Record<FieldType, FieldFormat> = {
  currency: {
    pattern: '${value}',
    decimals: 2,
    thousand_sep: ',',
  },
  percentage: {
    pattern: '{value}%',
    decimals: 0,
  },
  date: {
    pattern: 'YYYY-MM-DD',
  }
};
```

### Validation Checklist
- [ ] Type is in supported list
- [ ] Options validate against type schema
- [ ] Default value matches field type
- [ ] Name is 1-255 characters
- [ ] Position is unique within table
- [ ] No reserved field names (id, createdAt, etc.)
