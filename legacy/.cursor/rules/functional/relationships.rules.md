# Relationships Rules
**CURSOR: RULES-REL-001 through RULES-REL-003**

## RULES-REL-001: Link Fields (NOT STARTED)
**Module:** `backend/src/features/field/`

### Purpose
Create relationships between tables by linking records. Forms the basis for relational queries.

### Features
- [ ] Create Link field (many-to-many capable)
- [ ] Add/remove links from record
- [ ] Display linked records
- [ ] Filter by linked records
- [ ] Auto-update reverse links
- [ ] Cascade delete options

### Implementation Pattern
```typescript
// CURSOR: RULES-REL-001 - Link Fields

@Controller('fields')
export class FieldController {
  @Post()
  async createLinkField(@Body() dto: CreateLinkFieldDTO) {
    // 1. Validate source and target tables exist
    // 2. Create Link field
    // 3. Create reverse field on target table
    // 4. Create junction table for many-to-many
    // 5. Emit 'field:created'
  }
}

@Controller('records')
export class RecordController {
  @Post(':recordId/links/:fieldId')
  async addLink(
    @Param('recordId') recordId: string,
    @Param('fieldId') fieldId: string,
    @Body() dto: AddLinkDTO
  ) {
    // 1. Validate record and target record exist
    // 2. Check permissions on both tables
    // 3. Add junction record
    // 4. Update reverse link if exists
    // 5. Emit 'record:linked'
  }

  @Delete(':recordId/links/:fieldId/:linkedRecordId')
  async removeLink(
    @Param('recordId') recordId: string,
    @Param('fieldId') fieldId: string,
    @Param('linkedRecordId') linkedRecordId: string
  ) {
    // 1. Remove junction record
    // 2. Update reverse link
    // 3. Emit 'record:unlinked'
  }
}
```

### Link Field Configuration
```typescript
interface LinkFieldOptions {
  linkedTableId: string;        // Target table
  linkedFieldId: string;        // Reverse field (auto-created)
  
  relationshipType: 'many-to-many' | 'one-to-many';
  
  cascadeDelete: boolean;       // Delete linked records if parent deleted
  
  displayFormat?: {
    showCount?: boolean;
    previewFields?: string[];  // Fields to show in link preview
    maxPreviewRecords?: number;
  };
}
```

### Database Schema
```prisma
model LinkJunction {
  id              String   @id @default(cuid())
  fromRecordId    String
  toRecordId      String
  
  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### API Endpoints
```
POST   /api/v1/records/:recordId/links/:fieldId
DELETE /api/v1/records/:recordId/links/:fieldId/:linkedRecordId
GET    /api/v1/records/:recordId/links/:fieldId
```

### WebSocket Events
```typescript
socket.emit('record:linked', {
  recordId: string,
  fieldId: string,
  linkedRecordId: string
});

socket.emit('record:unlinked', {
  recordId: string,
  fieldId: string,
  linkedRecordId: string
});
```

---

## RULES-REL-002: Lookup Fields (NOT STARTED)
**Module:** `backend/src/features/field/`

### Purpose
Query values from linked records. Displays related field values dynamically.

### Features
- [ ] Create Lookup field (references Link field)
- [ ] Select which field to lookup
- [ ] Auto-update when linked records change
- [ ] Aggregate lookup results (e.g., comma-separated)
- [ ] Multiple lookups from same link

### Implementation Pattern
```typescript
// CURSOR: RULES-REL-002 - Lookup Fields

export class FieldService {
  async createLookupField(dto: CreateLookupFieldDTO) {
    // 1. Validate link field exists
    // 2. Validate target field exists in linked table
    // 3. Create Lookup field
    // 4. Initialize lookup values for existing records
    // 5. Subscribe to linked record updates
  }

  async updateLookupValues(
    tableId: string,
    linkedRecordId: string,
    lookupFieldId: string
  ) {
    // When linked record changes, update all lookup fields
    // 1. Find all lookup fields referencing this link
    // 2. Recalculate values for all parent records
    // 3. Broadcast updates
  }
}
```

### Lookup Field Configuration
```typescript
interface LookupFieldOptions {
  linkFieldId: string;          // Link field to traverse
  targetFieldId: string;        // Field to lookup in linked table
  
  aggregation?: 'first' | 'all' | 'comma-separated' | 'count';
  
  displayFormat?: {
    separator?: string;         // For 'all' aggregation
    maxItems?: number;
    truncate?: boolean;
  };
}
```

### Lookup Value Examples
```
// Single link
Company → Employees Link → Name Lookup
Result: "John Doe"

// Multiple links
Company → Employees Link → Salary Lookup (aggregated)
Result: "[50000, 60000, 75000]" or "$50,000 + $60,000 + $75,000"

// Nested Lookup
Company → Employees Link → Department Link → Budget Lookup
Result: "$1,000,000"
```

### Query Pattern
```typescript
// When fetching record with lookup field:
const record = await this.recordService.getRecord(recordId, {
  expandLookupFields: true  // Auto-fetch linked records
});

// SQL generated:
SELECT
  r.*,
  (SELECT array_agg(lr."name")
   FROM linked_records lr
   JOIN junction ON junction.to_record_id = lr.id
   WHERE junction.from_record_id = r.id)
  AS lookup_employees_names
FROM records r;
```

---

## RULES-REL-003: Rollup Fields (NOT STARTED)
**Module:** `backend/src/features/field/`

### Purpose
Aggregate data from linked records (SUM, AVG, COUNT, etc.).

### Features
- [ ] Create Rollup field
- [ ] Select aggregation function
- [ ] Filter linked records before aggregation
- [ ] Auto-update when data changes
- [ ] Support all aggregation functions

### Supported Aggregations
```
COUNT              // Count linked records
SUM                // Sum numeric field
AVG                // Average numeric field
MAX                // Maximum value
MIN                // Minimum value
CONCAT             // Join text values
COUNT_UNIQUE       // Count unique values
PERCENT_EMPTY      // % of empty cells
PERCENT_FILLED     // % of filled cells
EARLIEST_DATE      // Earliest date value
LATEST_DATE        // Latest date value
```

### Implementation Pattern
```typescript
// CURSOR: RULES-REL-003 - Rollup Fields

export class FieldService {
  async createRollupField(dto: CreateRollupFieldDTO) {
    // 1. Validate link field exists
    // 2. Validate target field compatible with aggregation
    // 3. Create Rollup field
    // 4. Calculate initial values for all records
  }

  async recalculateRollups(
    tableId: string,
    linkedRecordId: string
  ) {
    // When linked data changes, recalculate rollups
    // 1. Find rollup fields on this table
    // 2. Recalculate values
    // 3. Broadcast updates
  }

  private calculateRollup(
    aggregation: string,
    values: any[]
  ): any {
    switch(aggregation) {
      case 'SUM':
        return values.reduce((a, b) => a + b, 0);
      case 'AVG':
        return values.reduce((a, b) => a + b, 0) / values.length;
      case 'COUNT':
        return values.length;
      case 'CONCAT':
        return values.join(', ');
      // ... more cases
    }
  }
}
```

### Rollup Field Configuration
```typescript
interface RollupFieldOptions {
  linkFieldId: string;          // Link field to traverse
  targetFieldId: string;        // Field to aggregate
  aggregation: 'COUNT' | 'SUM' | 'AVG' | 'MAX' | 'MIN' | 'CONCAT';
  
  // Optional: filter linked records
  where?: FilterCondition[];
}
```

### Rollup Value Examples
```
// COUNT example
Company → Employees Link → COUNT Rollup
Result: 5 (number of employees)

// SUM example
Project → Tasks Link → Hours Field → SUM Rollup
Result: 120 (total hours)

// AVG example
Product → Reviews Link → Rating Field → AVG Rollup
Result: 4.5 (average rating)

// CONCAT example
Person → Certifications Link → Name Field → CONCAT Rollup
Result: "AWS, GCP, Azure"
```

---

## Relationship Patterns

### Complete Relationship Example
```
// Table: Companies
├─ id: "company1"
├─ name: "TechCorp"
└─ employees: Link Field → Employees table

// Table: Employees
├─ id: "emp1"
├─ name: "John"
├─ salary: 50000
├─ company: Link Field → Companies table (reverse)
├─ company_name: Lookup Field (Company.name)
└─ avg_salary_in_company: Rollup Field (SUM of salary)

// Results:
Company "TechCorp" {
  employee_count: 5 (Rollup COUNT)
  total_payroll: 250000 (Rollup SUM)
  avg_salary: 50000 (Rollup AVG)
}

Employee "John" {
  company_name: "TechCorp" (Lookup)
  team_salary_range: "$30k - $100k" (Lookups)
}
```

### Performance Considerations
- [ ] Cache rollup calculations
- [ ] Use indexed queries for lookups
- [ ] Batch recalculate on bulk updates
- [ ] Debounce rollup recalculation
- [ ] Consider materialized views for complex queries

### Circular References
```
// Prevent circular lookups:
Company ──→ Employees Link ──→ Company Lookup ✗ (CIRCULAR!)

// Valid patterns:
Company ──→ Employees Link ──→ Salary Lookup ✓
Employees ──→ Department Link ──→ Company Lookup ✓
```

---

## Implementation Roadmap

### Phase 1: Link Fields (MVP)
1. Create Link field type
2. Add junction table
3. Link/unlink API endpoints
4. WebSocket events

### Phase 2: Lookup Fields
1. Create Lookup field type
2. Auto-fetch linked values
3. Cascade updates

### Phase 3: Rollup Fields
1. Create Rollup field type
2. Implement aggregation functions
3. Performance optimization

### Phase 4: Advanced Features
1. Filtering on linked records
2. Sorting by lookup/rollup
3. Conditional rollups
4. Reverse lookups
