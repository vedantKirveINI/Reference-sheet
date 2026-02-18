# Data Model Rules
**CURSOR: RULES-DATA-001 through RULES-DATA-003**

## RULES-DATA-001: Workspace Management (COMPLETE)
**Module:** `backend/src/features/space/`

### Purpose
Create isolated workspace containers for organizing data by tenant/organization.

### Requirements
- [x] Create workspace (Space) with metadata
- [x] List user's workspaces
- [x] Update workspace details
- [x] Delete workspace (soft delete)

### API Endpoints
```
POST   /api/v1/spaces
GET    /api/v1/spaces
PATCH  /api/v1/spaces/:id
DELETE /api/v1/spaces/:id
```

### Implementation Pattern
```typescript
// backend/src/features/space/space.controller.ts
// CURSOR: RULES-DATA-001 - Workspace Management

@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post()
  async create(@Body() dto: CreateSpaceDTO) {
    return this.spaceService.create(dto);
  }
}
```

### Database Schema
```prisma
model Space {
  id          String    @id @default(cuid())
  name        String
  description String?
  metadata    Json      @default("{}")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  bases       Base[]
}
```

### Validation
- Space name: 1-255 characters, required
- Description: optional, max 1000 chars
- Metadata: valid JSON object

---

## RULES-DATA-002: Base Management (COMPLETE)
**Module:** `backend/src/features/base/`

### Purpose
Organize tables within a workspace (Space). Base acts as a logical container.

### Requirements
- [x] Create base with metadata (source, integrations)
- [x] List bases in a space
- [x] Update base settings
- [x] Duplicate base with all tables/views
- [x] Delete base (soft delete)

### API Endpoints
```
POST   /api/v1/bases
GET    /api/v1/spaces/:spaceId/bases
PATCH  /api/v1/bases/:id
POST   /api/v1/bases/:id/duplicate
DELETE /api/v1/bases/:id
```

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-002 - Base Management

export class BaseService {
  async create(payload: CreateBaseDTO): Promise<Base> {
    // Create base with nested tables/views
    // Emit event: 'base:created'
  }

  async duplicate(baseId: string): Promise<Base> {
    // Clone all tables, views, fields, permissions
    // Use Prisma transaction
  }
}
```

### Database Schema
```prisma
model Base {
  id        String   @id @default(cuid())
  spaceId   String
  space     Space    @relation(fields: [spaceId], references: [id])
  name      String
  source    String?  // e.g., 'csv', 'api', 'manual'
  metadata  Json     @default("{}")
  tables    TableMeta[]
  
  @@index([spaceId])
}
```

### Key Metadata Fields
```json
{
  "source": "csv",
  "sourceId": "upload-12345",
  "integrations": ["zapier", "slack"],
  "archived": false
}
```

---

## RULES-DATA-003: Table Management (COMPLETE)
**Module:** `backend/src/features/table/`

### Purpose
Core data container. Tables contain fields (columns) and records (rows).

### Requirements
- [x] Create table with field definitions
- [x] List tables in a base
- [x] Update table schema (add/remove/modify fields)
- [x] Delete table
- [x] Create data stream for live updates
- [x] Rename table
- [x] Reorder columns

### API Endpoints
```
POST   /api/v1/tables
GET    /api/v1/bases/:baseId/tables
PATCH  /api/v1/tables/:id
DELETE /api/v1/tables/:id
POST   /api/v1/tables/:id/data-stream
GET    /api/v1/tables/:id/data-stream
```

### Implementation Pattern
```typescript
// CURSOR: RULES-DATA-003 - Table Management

@Controller('tables')
export class TableController {
  @Post()
  async create(@Body() dto: CreateTableDTO) {
    // 1. Validate fields array
    // 2. Create table in Prisma
    // 3. Create system fields (id, createdAt, etc.)
    // 4. Create default Grid view
    // 5. Emit 'table:created' event
  }

  @Patch(':tableId')
  async update(@Param('tableId') id: string, @Body() dto: UpdateTableDTO) {
    // Use transaction for schema changes
    // Update Prisma schema
    // Broadcast via WebSocket
  }
}
```

### Database Schema
```prisma
model TableMeta {
  id              String   @id @default(cuid())
  baseId          String
  base            Base     @relation(fields: [baseId], references: [id])
  name            String
  dbTableName     String?  // PostgreSQL table name
  description     String?
  status          String   @default("active") // active, archived
  
  fields          Field[]
  views           View[]
  records         Op[]     // Operations log
  dataStreams     DataStream[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([baseId])
  @@unique([baseId, name])
}
```

### WebSocket Events
```typescript
// Emit when table updated
socket.emit('table:updated', {
  tableId: string,
  changes: { name?, description?, metadata? }
});

// Emit when field added/removed
socket.emit('table:fieldChanged', {
  tableId: string,
  fieldId: string,
  action: 'add' | 'remove' | 'update'
});
```

---

## Hierarchy Diagram
```
Space (Workspace)
  └─ Base (Container)
      └─ TableMeta (Data Container)
          ├─ Field (Columns)
          ├─ View (Grid/Form/Kanban)
          └─ Record (Rows via Ops)
```

## Common Patterns
- Always wrap multi-table operations in `prisma.$transaction()`
- Use `createdAt`, `updatedAt` timestamps on all models
- Soft delete via `status: 'archived'` field
- Emit WebSocket events after successful DB operations
- Use `@nestjs/common` exceptions for error handling
