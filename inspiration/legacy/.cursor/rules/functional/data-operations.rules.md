# Data Operations Rules
**CURSOR: RULES-DATA-004 through RULES-DATA-010**

## RULES-DATA-004: Record CRUD Operations (COMPLETE)
**Module:** `backend/src/features/record/`

### Purpose
Create, read, update, and delete individual records (rows).

### Requirements
- [x] Create record with field values
- [x] Read single record
- [x] Update record fields
- [x] Delete record (soft delete)
- [x] Restore deleted record
- [x] Get record by ID
- [x] Batch read records

### API Endpoints
```
POST   /api/v1/records
GET    /api/v1/records/:recordId
PATCH  /api/v1/records/:recordId
DELETE /api/v1/records/:recordId
POST   /api/v1/records/:recordId/restore
GET    /api/v1/tables/:tableId/records
POST   /api/v1/tables/:tableId/records/batch
```

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-004 - Record CRUD Operations

@Controller('records')
export class RecordController {
  @Post()
  async create(@Body() dto: CreateRecordDTO) {
    // 1. Validate table exists
    // 2. Validate field values against types
    // 3. Create record in database
    // 4. Emit 'record:created' WebSocket event
    // 5. Log operation to Ops table
  }

  @Patch(':recordId')
  async update(
    @Param('recordId') id: string,
    @Body() dto: UpdateRecordDTO
  ) {
    // 1. Validate record exists
    // 2. Validate field updates
    // 3. Check permissions
    // 4. Update database
    // 5. Broadcast changes
  }

  @Delete(':recordId')
  async delete(@Param('recordId') id: string) {
    // Soft delete: set status = 'archived'
    // Emit 'record:deleted' event
  }
}
```

### Database Schema
```prisma
model Op {
  id          String   @id @default(cuid())
  tableId     String
  table       TableMeta @relation(fields: [tableId], references: [id])
  
  // Record data stored as JSON
  cellValues  Json     // { fieldId: value, ... }
  
  // Metadata
  status      String   @default("active")  // active, archived
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([tableId])
}
```

### Record Format
```typescript
interface Record {
  id: string;
  tableId: string;
  
  // Dynamic fields stored as key-value pairs
  cellValues: {
    [fieldId]: any;  // Value type depends on Field.type
  };
  
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}
```

### WebSocket Events
```typescript
socket.emit('record:created', {
  tableId: string,
  record: Record
});

socket.emit('record:updated', {
  tableId: string,
  recordId: string,
  changes: { fieldId: newValue, ... }
});

socket.emit('record:deleted', {
  tableId: string,
  recordId: string
});
```

---

## RULES-DATA-005: Import/Export Operations (COMPLETE)
**Module:** `backend/src/features/table/`

### Purpose
Bulk import data from CSV/Excel and export to various formats.

### Import Features
- [x] CSV upload with field mapping
- [x] Excel file support
- [x] Duplicate detection
- [x] Data validation
- [x] Error reporting
- [x] Progress tracking
- [x] Async import (Bull MQ)

### Export Features
- [x] Export to CSV
- [x] Export to JSON
- [x] Export with filters/sorts applied
- [x] Include/exclude fields
- [x] Custom formatting

### API Endpoints
```
POST   /api/v1/tables/:tableId/import
GET    /api/v1/tables/:tableId/import-status/:jobId
POST   /api/v1/tables/:tableId/export
```

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-005 - Import/Export Operations

@Controller('tables')
export class TableController {
  @Post(':tableId/import')
  async importData(
    @Param('tableId') tableId: string,
    @Body() dto: ImportDataDTO
  ) {
    // 1. Validate file
    // 2. Parse CSV/Excel
    // 3. Map columns to fields
    // 4. Queue import job in Bull MQ
    // 5. Return job ID for tracking
  }

  @Post(':tableId/export')
  async exportData(
    @Param('tableId') tableId: string,
    @Body() dto: ExportDataDTO
  ) {
    // 1. Get records based on view/filters
    // 2. Format data per export type
    // 3. Return file stream or download URL
  }
}

// In Bull MQ processor:
@Process('import')
async handleImport(job: Job<ImportJobData>) {
  // 1. Parse records
  // 2. Validate each row
  // 3. Batch insert to database
  // 4. Report progress: job.progress(50)
  // 5. Emit 'import:completed' event
}
```

### Import Job Structure
```typescript
interface ImportJobData {
  tableId: string;
  file: {
    buffer: Buffer;
    filename: string;
    mimetype: 'text/csv' | 'application/vnd.ms-excel';
  };
  mapping: {
    [columnIndex]: {
      fieldId: string;
      dataType: FieldType;
    };
  };
  options: {
    skipHeader: boolean;
    duplicateAction: 'skip' | 'update' | 'error';
    onError: 'stop' | 'continue';
  };
}
```

### Export Configuration
```typescript
interface ExportDataDTO {
  format: 'csv' | 'json' | 'excel';
  
  fields?: string[];              // Specific fields to export
  viewId?: string;                // Apply view filters/sorts
  
  formatting?: {
    includeHeader: boolean;
    dateFormat: string;            // 'YYYY-MM-DD'
    numberFormat: string;          // '0.00'
  };
}
```

---

## RULES-DATA-006: Batch Operations (IN PROGRESS)
**Module:** `backend/src/features/record/`

### Purpose
Perform operations on multiple records efficiently.

### Batch Operations
- [x] Bulk update (same value for all)
- [x] Bulk delete
- [ ] Bulk update with formula
- [ ] Bulk export
- [ ] Bulk apply tags
- [ ] Bulk change status

### API Endpoints
```
PATCH  /api/v1/records/batch/update
DELETE /api/v1/records/batch/delete
POST   /api/v1/records/batch/status
POST   /api/v1/records/batch/field-value
```

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-006 - Batch Operations

export class RecordService {
  async batchUpdate(
    tableId: string,
    recordIds: string[],
    updates: { [fieldId]: value }
  ): Promise<void> {
    // 1. Validate all record IDs exist
    // 2. Validate field updates
    // 3. Use transaction for atomicity
    // 4. Emit batch event: 'records:updated'
  }

  async batchDelete(
    tableId: string,
    recordIds: string[]
  ): Promise<void> {
    // Soft delete multiple records
    // Emit 'records:deleted'
  }
}
```

### Batch API Payload
```typescript
interface BatchUpdateDTO {
  recordIds: string[];
  updates: {
    [fieldId]: any;               // Set same value for all
  };
  strategy?: 'replace' | 'append'; // For multi-select fields
}
```

---

## RULES-DATA-007: Undo/Redo (NOT STARTED)
**Module:** `backend/src/bullMq/` | `frontend/src/components/`

### Purpose
Maintain operation history and allow reverting changes.

### Requirements
- [ ] Track all changes in Ops table with versioning
- [ ] Undo last change
- [ ] Redo last undone change
- [ ] Undo/Redo stack per user
- [ ] Clear history on interval
- [ ] Persist undo stack (5000+ levels)

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-007 - Undo/Redo

export class UndoRedoService {
  private undoStack = new Stack<Operation>();
  private redoStack = new Stack<Operation>();

  async undo(userId: string, tableId: string): Promise<void> {
    const op = this.undoStack.pop();
    if (!op) return;

    // Revert the operation
    await this.recordService.revertOperation(op);
    this.redoStack.push(op);
    
    // Broadcast to all users
    this.gateway.emit('record:undone', { op });
  }

  async redo(userId: string, tableId: string): Promise<void> {
    const op = this.redoStack.pop();
    if (!op) return;
    
    await this.recordService.applyOperation(op);
    this.undoStack.push(op);
    
    this.gateway.emit('record:redone', { op });
  }
}
```

### Ops Tracking Schema
```prisma
model Op {
  id          String   @id @default(cuid())
  tableId     String
  recordId    String?
  fieldId     String?
  
  // Operation details
  type        String   // 'create', 'update', 'delete'
  before      Json?    // Previous value
  after       Json?    // New value
  
  userId      String
  timestamp   DateTime @default(now())
}
```

---

## RULES-DATA-008: Formula Fields (COMPLETE)
**Module:** `backend/src/features/field/` | `backend/src/bullMq/`

### Purpose
Support calculated fields with 20+ formula functions.

### Supported Functions
```
// Text
CONCAT(field1, field2, ...)
UPPER(field)
LOWER(field)
LEN(field)
SUBSTRING(field, start, length)
TRIM(field)
REPLACE(field, from, to)

// Number
SUM(field)
AVG(field)
MAX(field)
MIN(field)
ROUND(value, decimals)
ABS(value)
COUNT()

// Date
NOW()
TODAY()
DATEADD(date, days)
DATEDIFF(date1, date2)
YEAR(date)
MONTH(date)
DAY(date)

// Logic
IF(condition, true_value, false_value)
AND(cond1, cond2, ...)
OR(cond1, cond2, ...)
NOT(condition)

// Conditional
SWITCH(value, case1, result1, case2, result2, ...)
```

### Formula Evaluation
```typescript
export class FormulaService {
  async evaluateFormula(
    formula: string,
    record: Record,
    fields: Field[]
  ): Promise<any> {
    // 1. Parse formula using safe expression parser
    // 2. Replace field references with values
    // 3. Execute in sandboxed environment
    // 4. Return result
  }
}
```

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-008 - Formula Fields

export class FieldService {
  async createFormulaField(dto: CreateFormulaFieldDTO) {
    // 1. Parse and validate formula syntax
    // 2. Check field references exist
    // 3. Create Field with type='formula'
    // 4. Queue formula calculation job for all records
  }

  async recalculateFormulas(tableId: string) {
    // Queue job to recalculate all formula fields
    // when dependency field changes
  }
}
```

---

## RULES-DATA-009: Formula Dependencies (IN PROGRESS)
**Module:** `backend/src/bullMq/`

### Purpose
Track and update dependent formulas when source fields change.

### Requirements
- [x] Build dependency graph
- [x] Identify cascade updates
- [ ] Optimize recalculation (only affected formulas)
- [ ] Handle circular references
- [ ] Performance tuning for large tables

### Dependency Graph
```typescript
interface DependencyGraph {
  // fieldId -> list of formula fields that depend on it
  [fieldId]: string[];
}

// Example:
// {
//   "email": ["domain_field", "email_domain"],
//   "phone": ["formatted_phone"],
//   "formatted_phone": ["full_contact_info"]
// }
```

---

## RULES-DATA-010: Advanced Formulas (NOT STARTED)
**Module:** `backend/src/features/field/`

### Purpose
Support 50+ formula functions beyond basic set.

### Additional Functions
```
// Aggregation
SUMIF(range, criteria, sum_range)
COUNTIF(range, criteria)
AVERAGEIF(range, criteria)

// Lookup
VLOOKUP(value, range, column)
INDEX(range, row)
MATCH(value, range)

// Advanced Text
REGEX(text, pattern)
SPLIT(text, delimiter)
JOIN(array, delimiter)

// Advanced Math
MOD(dividend, divisor)
POWER(base, exponent)
SQRT(value)
LOG(value, base)

// Type checking
TYPE(value)
ISNUMBER(value)
ISTEXT(value)
ISEMPTY(value)
```

---

## Common Patterns

### Record Validation
```typescript
function validateRecord(record: Record, fields: Field[]): string[] {
  const errors: string[] = [];
  
  fields.forEach(field => {
    const value = record.cellValues[field.id];
    
    // Check required
    if (field.required && !value) {
      errors.push(`${field.name} is required`);
    }
    
    // Check type
    if (!isValidType(value, field.type)) {
      errors.push(`${field.name} has invalid type`);
    }
  });
  
  return errors;
}
```

### Pagination Pattern
```typescript
interface PaginationOptions {
  limit: number;      // default 100, max 1000
  offset: number;     // default 0
  sort?: SortCondition[];
  filter?: FilterCondition[];
}

const DEFAULT_PAGINATION = {
  limit: 100,
  offset: 0
};
```

### Status Change Pattern
```typescript
async changeRecordStatus(
  recordId: string,
  newStatus: 'active' | 'archived'
) {
  await this.prisma.op.update({
    where: { id: recordId },
    data: { status: newStatus }
  });
  
  this.gateway.emit('record:statusChanged', {
    recordId, newStatus
  });
}
```
