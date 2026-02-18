# Database Operations Rules
**CURSOR: TECH-DB-001 through TECH-DB-006**

## TECH-DB-001: Transactions & Data Consistency (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/src/features/`

### Purpose
Enforce transactional integrity for multi-step operations.

### Transaction Pattern (MANDATORY)

```typescript
// CURSOR: TECH-DB-001 - Transaction Pattern

// ✅ GOOD - Wrapped in transaction
async createTableWithFields(
  tableData: CreateTableDTO,
  fieldConfigs: FieldConfig[]
): Promise<Table> {
  return this.prisma.$transaction(async (prisma) => {
    // Step 1: Create table
    const table = await prisma.tableMeta.create({
      data: {
        name: tableData.name,
        baseId: tableData.baseId,
        status: 'active',
      },
    });

    // Step 2: Create fields
    const fields = await Promise.all(
      fieldConfigs.map(config =>
        prisma.fieldMeta.create({
          data: {
            tableId: table.id,
            name: config.name,
            type: config.type,
            options: config.options,
          },
        })
      )
    );

    // Step 3: Update table with field count
    await prisma.tableMeta.update({
      where: { id: table.id },
      data: { fieldCount: fields.length },
    });

    return { table, fields };
  });
}

// ❌ BAD - Not transactional (data inconsistency risk)
async createTableWithFields(
  tableData: CreateTableDTO,
  fieldConfigs: FieldConfig[]
) {
  const table = await this.prisma.tableMeta.create({...});
  // ← If next line fails, table exists but no fields!
  const fields = await Promise.all(fieldConfigs.map(...));
}
```

### Rollback Pattern (for errors)

```typescript
// CURSOR: TECH-DB-001 - Rollback on Error

async updateRecordWithAudit(recordId: string, updates: any) {
  try {
    return await this.prisma.$transaction(async (prisma) => {
      // Update record
      const record = await prisma.op.update({
        where: { id: recordId },
        data: updates,
      });

      // Create audit log
      await prisma.auditLog.create({
        data: {
          recordId,
          action: 'update',
          changes: updates,
          timestamp: new Date(),
        },
      });

      return record;
    });
    // ← Both succeed or both fail (atomic)
  } catch (error) {
    // Transaction automatically rolled back
    throw new InternalServerErrorException('Update failed');
  }
}
```

---

## TECH-DB-002: Query Optimization (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Select Specific Fields Only

```typescript
// CURSOR: TECH-DB-002 - Selective Queries

// ✅ GOOD - Only fetch needed fields
async getTableRecords(tableId: string) {
  return this.prisma.op.findMany({
    where: { tableId },
    select: {
      id: true,           // Only ID
      cellValues: true,   // Only values
      createdAt: true,
      // ← Skip: description, metadata, etc.
    },
    take: 100,
  });
}

// ❌ BAD - Fetches everything
async getTableRecords(tableId: string) {
  return this.prisma.op.findMany({
    where: { tableId },
    // ← Returns all fields (wasteful)
  });
}
```

### Pagination (Always)

```typescript
// CURSOR: TECH-DB-002 - Pagination

// ✅ GOOD - Paginated
const records = await this.prisma.op.findMany({
  where: { tableId },
  skip: (page - 1) * limit,  // Skip n records
  take: limit,               // Take n records
});

// ❌ BAD - No pagination (loads all records!)
const records = await this.prisma.op.findMany({
  where: { tableId },
  // ← Loads potentially 1M+ records
});
```

### Batch Operations

```typescript
// CURSOR: TECH-DB-002 - Batch Efficiency

// ✅ GOOD - Single query for multiple records
const recordIds = ['id1', 'id2', 'id3'];
const records = await this.prisma.op.findMany({
  where: {
    id: { in: recordIds },  // ← Load all at once
  },
});

// ❌ BAD - N+1 queries
const records = [];
for (const id of recordIds) {
  const record = await this.prisma.op.findUnique({
    where: { id },  // ← Query in loop (N+1 problem)
  });
  records.push(record);
}
```

### Indices (for WHERE clauses)

```typescript
// CURSOR: TECH-DB-002 - Database Indices

// Add to prisma/schema.prisma:
model Op {
  id        String   @id @default(cuid())
  tableId   String
  baseId    String
  createdAt DateTime @default(now())

  // ✅ Index for common queries
  @@index([tableId])                    // Query by table
  @@index([baseId, createdAt])          // Composite index
}

// Queries using indices are FAST:
const records = await this.prisma.op.findMany({
  where: { tableId },  // ← Uses @@index([tableId])
});
```

---

## TECH-DB-003: JSON Field Storage (HIGH)
**Priority:** HIGH | Status: Baseline

### JSONB Storage Pattern

```typescript
// CURSOR: TECH-DB-003 - JSON Fields

// Prisma schema
model TableMeta {
  id          String   @id
  name        String
  
  // ✅ Flexible metadata as JSON
  columnMeta  Json     // { columnId: { width: 200, frozen: true, ... } }
  viewConfig  Json     // { viewId: { filters: [...], sorts: [...] } }
  metadata    Json     // Custom key-value pairs
}

// Service usage
async saveColumnWidth(tableId: string, columnId: string, width: number) {
  const table = await this.prisma.tableMeta.findUnique({
    where: { id: tableId },
  });

  const columnMeta = (table.columnMeta as any) || {};
  columnMeta[columnId] = { width, lastModified: new Date() };

  return this.prisma.tableMeta.update({
    where: { id: tableId },
    data: {
      columnMeta: columnMeta,  // ← Update JSON field
    },
  });
}

// Querying JSON fields
async getColumnWidth(tableId: string, columnId: string) {
  const table = await this.prisma.tableMeta.findUnique({
    where: { id: tableId },
  });

  return ((table.columnMeta as any)[columnId] || {}).width || 100;
}
```

---

## TECH-DB-004: Migrations (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Migration Workflow

```bash
# CURSOR: TECH-DB-004 - Migrations

# 1. Modify schema.prisma
# 2. Generate migration
npx prisma migrate dev --name add_column_metadata

# 3. This creates:
# - prisma/migrations/[timestamp]_add_column_metadata/migration.sql
# - Updates prisma/.prisma/client

# 4. Production deployment
npx prisma migrate deploy

# 5. Preview migration (don't apply)
npx prisma migrate resolve
```

### Schema Change Examples

```prisma
// CURSOR: TECH-DB-004 - Schema Changes

// ADD COLUMN
model Op {
  id          String
  // ✅ ADD new field
  enrichedAt  DateTime?
  status      String   @default("active")
}

// ADD INDEX
model Op {
  id        String
  tableId   String
  status    String

  // ✅ ADD index for common query
  @@index([tableId, status])
}

// RENAME FIELD
model Field {
  id        String
  // ✅ Rename (use @db.rename in migration)
  fieldName String  @map("name")
}
```

---

## TECH-DB-005: Caching (HIGH)
**Priority:** HIGH | Status: Baseline

### Redis Cache Pattern

```typescript
// CURSOR: TECH-DB-005 - Cache Layer

@Injectable()
export class RecordCacheService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async getTableRecords(tableId: string): Promise<Record[]> {
    const cacheKey = `records:${tableId}`;

    // 1. Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Query database
    const records = await this.prisma.op.findMany({
      where: { tableId },
    });

    // 3. Store in cache (1 hour TTL)
    await this.redis.set(
      cacheKey,
      JSON.stringify(records),
      'EX',
      3600
    );

    return records;
  }

  // Invalidate cache when data changes
  async invalidateTableCache(tableId: string) {
    await this.redis.del(`records:${tableId}`);
  }

  async updateRecord(recordId: string, updates: any) {
    const record = await this.prisma.op.update({
      where: { id: recordId },
      data: updates,
    });

    // ← Invalidate related caches
    await this.invalidateTableCache(record.tableId);

    return record;
  }
}
```

### Cache Invalidation Strategy

```typescript
// CURSOR: TECH-DB-005 - Cache Invalidation

// Pattern: Invalidate on write
async createRecord(dto: CreateRecordDTO) {
  const record = await this.repository.create(dto);
  
  // Invalidate table cache (fresh load needed)
  await this.cache.invalidate(`records:${dto.tableId}`);
  
  // Also invalidate base cache (counts changed)
  await this.cache.invalidate(`base:${record.baseId}`);
  
  return record;
}
```

---

## TECH-DB-006: Soft Delete Pattern (HIGH)
**Priority:** HIGH | Status: Baseline

### Soft Delete Implementation

```typescript
// CURSOR: TECH-DB-006 - Soft Delete

// Schema includes status field
model Op {
  id        String  @id
  status    String  @default("active")  // active, archived
  deletedAt DateTime?
}

// Repository marks as deleted (doesn't remove)
async delete(recordId: string) {
  return this.prisma.op.update({
    where: { id: recordId },
    data: {
      status: 'archived',
      deletedAt: new Date(),
    },
  });
}

// Query excludes deleted records
async findActive(tableId: string) {
  return this.prisma.op.findMany({
    where: {
      tableId,
      status: 'active',  // ← Exclude archived
    },
  });
}

// Recovery (un-delete)
async restore(recordId: string) {
  return this.prisma.op.update({
    where: { id: recordId },
    data: {
      status: 'active',
      deletedAt: null,
    },
  });
}
```

---

## Acceptance Criteria (All Database Rules)

- [ ] Multi-step operations wrapped in transactions
- [ ] Queries select only needed fields
- [ ] Pagination implemented (no loading all records)
- [ ] Batch queries for N+1 prevention
- [ ] Indices created for common WHERE clauses
- [ ] JSON fields used for flexible metadata
- [ ] Migrations generated for schema changes
- [ ] Cache invalidation on updates
- [ ] Soft delete implemented (no hard deletes)
- [ ] Query performance <100ms
- [ ] No sensitive data in logs

