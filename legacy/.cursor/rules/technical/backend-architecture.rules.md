# Backend Architecture Rules
**CURSOR: TECH-BACKEND-001 through TECH-BACKEND-005**

## TECH-BACKEND-001: NestJS Module Structure (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/src/`

### Purpose
Enforce strict NestJS module architecture for scalability, testability, and maintainability across all features.

### Strict File Structure
Every feature module MUST follow this structure:

```
backend/src/features/{feature}/
├── {feature}.controller.ts          # HTTP endpoints only
├── {feature}.service.ts             # Business logic only
├── {feature}.repository.ts          # Database access only
├── {feature}.module.ts              # DI configuration
├── dto/
│   ├── create-{feature}.dto.ts
│   ├── update-{feature}.dto.ts
│   └── {feature}.response.dto.ts
├── types/
│   ├── {feature}.types.ts
│   └── {feature}.interface.ts
├── __tests__/
│   ├── {feature}.controller.spec.ts
│   ├── {feature}.service.spec.ts
│   └── {feature}.repository.spec.ts
└── README.md                        # Feature documentation
```

### Separation of Concerns (MANDATORY)

**Controller** (`{feature}.controller.ts`):
- ✅ Receive HTTP requests
- ✅ Validate input via DTOs (ZodValidationPipe)
- ✅ Call service methods
- ✅ Return HTTP responses
- ❌ NO business logic
- ❌ NO database queries
- ❌ NO direct Prisma calls

```typescript
// CURSOR: TECH-BACKEND-001 - Controller Pattern
import { Body, Controller, Post, UseGuards, UseFilters } from '@nestjs/common';
import { CreateRecordDTO } from './dto/create-record.dto';
import { RecordService } from './record.service';
import { JwtAuthGuard } from '@/guards/jwt-auth.guard';
import { RolePermissionGuard } from '@/guards/role-permission.guard';

@Controller('records')
@UseGuards(JwtAuthGuard, RolePermissionGuard)
@UseFilters(HttpExceptionFilter)
export class RecordController {
  constructor(private readonly recordService: RecordService) {}

  @Post()
  async create(
    @Body() dto: CreateRecordDTO,
    @Req() request: AuthenticatedRequest,
  ) {
    // 1. DTO validation is automatic (ZodValidationPipe)
    // 2. Guard checks permissions (RolePermissionGuard)
    // 3. Call service (business logic)
    const record = await this.recordService.create(dto, request.user.id);
    
    // 4. Return response DTO
    return new RecordResponseDTO(record);
  }
}
```

**Service** (`{feature}.service.ts`):
- ✅ Business logic
- ✅ Data transformations
- ✅ Orchestrate operations
- ✅ Call repository methods
- ✅ Emit WebSocket events
- ❌ NO HTTP layer access
- ❌ NO direct database queries
- ❌ NO external API calls (use dedicated provider)

```typescript
// CURSOR: TECH-BACKEND-001 - Service Pattern
import { Injectable } from '@nestjs/common';
import { RecordRepository } from './record.repository';
import { GatewayService } from '@/gateway/gateway.service';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class RecordService {
  constructor(
    private readonly recordRepository: RecordRepository,
    private readonly gateway: GatewayService,
  ) {}

  async create(dto: CreateRecordDTO, userId: string): Promise<Record> {
    // 1. Validate business logic
    const table = await this.recordRepository.getTable(dto.tableId);
    if (!table) {
      throw new BadRequestException('Table not found');
    }

    // 2. Process data
    const record = this.mapDTOToEntity(dto);

    // 3. Call repository
    const created = await this.recordRepository.create(record);

    // 4. Emit WebSocket event for real-time sync
    this.gateway.server.emit('record:created', {
      tableId: dto.tableId,
      record: created,
      userId,
    });

    return created;
  }

  private mapDTOToEntity(dto: CreateRecordDTO): Record {
    // Data transformation logic
    return {
      ...dto,
      createdAt: new Date(),
    };
  }
}
```

**Repository** (`{feature}.repository.ts`):
- ✅ Database queries ONLY
- ✅ Prisma ORM calls
- ✅ Transactions
- ✅ Query optimization
- ❌ NO business logic
- ❌ NO HTTP responses
- ❌ NO WebSocket events

```typescript
// CURSOR: TECH-BACKEND-001 - Repository Pattern
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class RecordRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRecordInput): Promise<Record> {
    return this.prisma.op.create({
      data: {
        tableId: data.tableId,
        cellValues: data.cellValues,
        status: 'active',
      },
    });
  }

  async findById(id: string): Promise<Record | null> {
    return this.prisma.op.findUnique({
      where: { id },
    });
  }

  async findByTable(tableId: string): Promise<Record[]> {
    return this.prisma.op.findMany({
      where: {
        tableId,
        status: 'active', // Filter archived
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: UpdateRecordInput): Promise<Record> {
    return this.prisma.op.update({
      where: { id },
      data: {
        cellValues: data.cellValues,
        updatedAt: new Date(),
      },
    });
  }
}
```

### Dependency Injection (Module Pattern)

```typescript
// CURSOR: TECH-BACKEND-001 - Module Configuration
import { Module } from '@nestjs/common';
import { RecordController } from './record.controller';
import { RecordService } from './record.service';
import { RecordRepository } from './record.repository';

@Module({
  controllers: [RecordController],
  providers: [RecordService, RecordRepository],
  exports: [RecordService], // Export if used by other modules
})
export class RecordModule {}
```

### Best Practices (MANDATORY)

1. **Type Safety**
   - ✅ ALL functions have return types
   - ✅ ALL parameters typed (no `any`)
   - ✅ Use DTOs for inputs
   - ✅ Use response DTOs for outputs

   ```typescript
   // ✅ GOOD
   async create(dto: CreateRecordDTO): Promise<RecordResponseDTO> {
     return new RecordResponseDTO(record);
   }

   // ❌ BAD
   async create(dto: any): any {
     return record;
   }
   ```

2. **Error Handling**
   - ✅ Use NestJS HTTP exceptions
   - ✅ Include error codes for frontend
   - ✅ Log errors with context

   ```typescript
   // ✅ GOOD
   throw new BadRequestException(
     'Record not found',
     'RECORD_NOT_FOUND',
   );

   // ❌ BAD
   throw new Error('not found');
   ```

3. **Logging**
   - ✅ Log important operations
   - ✅ Include request/user context
   - ✅ Use structured logging

   ```typescript
   // ✅ GOOD
   this.logger.debug('Creating record', {
     tableId: dto.tableId,
     userId,
   });

   // ❌ BAD
   console.log('creating');
   ```

4. **Async/Await**
   - ✅ Always use async/await (not .then())
   - ✅ Handle promise rejections
   - ✅ Use try/catch for errors

   ```typescript
   // ✅ GOOD
   try {
     const record = await this.recordRepository.findById(id);
   } catch (error) {
     this.logger.error('Failed to find record', error);
     throw new InternalServerErrorException();
   }

   // ❌ BAD
   this.recordRepository.findById(id).then(record => {
     // might not catch errors
   });
   ```

5. **Modularity**
   - ✅ Each feature is independent
   - ✅ Services are reusable
   - ✅ No circular dependencies
   - ✅ Use dependency injection

6. **Testing**
   - ✅ Unit tests for services
   - ✅ Integration tests for controllers
   - ✅ Mock repositories in tests
   - ✅ Minimum 80% coverage

---

## TECH-BACKEND-002: Prisma ORM & Database (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/prisma/`

### Mandatory Patterns

**Transactions** (Multi-table updates):
```typescript
// ✅ GOOD - Use transaction for consistency
const result = await this.prisma.$transaction(async (prisma) => {
  // All queries wrapped in transaction
  const field = await prisma.fieldMeta.create({ data: {...} });
  const table = await prisma.tableMeta.update({
    where: { id: tableId },
    data: { fields: [...] },
  });
  return { field, table };
});

// ❌ BAD - Separate queries (data inconsistency risk)
const field = await this.prisma.fieldMeta.create({...});
const table = await this.prisma.tableMeta.update({...});
```

**Migrations**:
```bash
# Create new migration after schema changes
npx prisma migrate dev --name description

# Production deployment
npx prisma migrate deploy
```

**JSON Fields** (Metadata storage):
```prisma
model TableMeta {
  id          String   @id
  columnMeta  Json     // { columnId: { width, options, ... } }
  viewConfig  Json     // { viewId: { filters, sorts, ... } }
}
```

**Indices** (Query optimization):
```prisma
model Op {
  id        String   @id
  tableId   String
  createdAt DateTime

  @@index([tableId])           // Query by tableId
  @@index([tableId, createdAt]) // Composite index for range queries
}
```

### Type Safety with Prisma

```typescript
// ✅ GOOD - Use generated Prisma types
import { Op, FieldMeta } from '@prisma/client';

async findRecord(id: string): Promise<Op> {
  return this.prisma.op.findUnique({ where: { id } });
}

// ❌ BAD - Using any
async findRecord(id: string): Promise<any> {
  return this.prisma.op.findUnique({ where: { id } });
}
```

---

## TECH-BACKEND-003: WebSocket & Real-time (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/src/gateway/`

### Event-Driven Architecture

```typescript
// CURSOR: TECH-BACKEND-003 - WebSocket Pattern

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL },
  adapter: redisIoAdapter, // For clustering
})
export class GridGateway {
  constructor(private recordService: RecordService) {}

  @SubscribeMessage('record:create')
  async handleRecordCreate(
    @MessageBody() dto: CreateRecordDTO,
    @ConnectedSocket() socket: Socket,
  ) {
    // 1. Validate user (auth via JWT token)
    const user = this.extractUserFromSocket(socket);
    
    // 2. Create record
    const record = await this.recordService.create(dto, user.id);
    
    // 3. Broadcast to all clients in table room
    this.server.to(`table:${dto.tableId}`).emit('record:created', {
      record,
      userId: user.id,
    });
  }

  @SubscribeMessage('grid:column-resize')
  async handleColumnResize(
    @MessageBody() data: ColumnResizeEvent,
    @ConnectedSocket() socket: Socket,
  ) {
    // 1. Save to database
    await this.saveColumnWidth(data.tableId, data.columnId, data.width);
    
    // 2. Broadcast to room
    this.server.to(`table:${data.tableId}`).emit('grid:column-resized', data);
  }
}
```

### Room Management

```typescript
// User joins table room
socket.join(`table:${tableId}`);

// Broadcast to room
server.to(`table:${tableId}`).emit('event', data);

// Broadcast to all EXCEPT sender
socket.broadcast.to(`table:${tableId}`).emit('event', data);

// Use rooms for real-time sync
server.to(`table:${tableId}`).emit('record:updated', record);
```

---

## TECH-BACKEND-004: Error Handling & Validation (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/src/`

### Validation Pipeline

```typescript
// CURSOR: TECH-BACKEND-004 - Validation Pattern

// 1. DTO with Zod validation
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const createRecordSchema = z.object({
  tableId: z.string().uuid(),
  cellValues: z.record(z.string(), z.any()),
});

export class CreateRecordDTO extends createZodDto(createRecordSchema) {}

// 2. Controller with auto-validation (ZodValidationPipe)
@Controller('records')
export class RecordController {
  @Post()
  async create(@Body() dto: CreateRecordDTO) {
    // DTO is automatically validated by pipe
    // If invalid, 400 error is thrown
  }
}

// 3. Service business logic validation
async create(dto: CreateRecordDTO): Promise<Record> {
  // Validate table exists
  const table = await this.repository.getTable(dto.tableId);
  if (!table) {
    throw new BadRequestException('Table not found', 'TABLE_NOT_FOUND');
  }

  // Validate field types
  for (const [fieldId, value] of Object.entries(dto.cellValues)) {
    const field = table.fields.find(f => f.id === fieldId);
    if (!field) {
      throw new BadRequestException(
        `Field ${fieldId} not found`,
        'FIELD_NOT_FOUND',
      );
    }
    
    if (!this.validateFieldType(field.type, value)) {
      throw new BadRequestException(
        `Invalid value for field ${fieldId}`,
        'INVALID_FIELD_VALUE',
      );
    }
  }

  return this.repository.create(dto);
}
```

### Error Response Format

```typescript
// CURSOR: TECH-BACKEND-004 - Error Format

// Success response
{
  "data": { /* resource */ },
  "error": null,
  "status": 200
}

// Error response
{
  "data": null,
  "error": {
    "message": "User-friendly error message",
    "code": "RESOURCE_NOT_FOUND",
    "statusCode": 404
  },
  "status": 404
}
```

---

## TECH-BACKEND-005: Performance & Caching (HIGH)
**Priority:** HIGH | Status: Baseline | Module: `backend/src/`

### Query Optimization

```typescript
// ✅ GOOD - Specific select
const records = await this.prisma.op.findMany({
  select: { id: true, cellValues: true }, // Only needed fields
  where: { tableId },
  take: 100, // Pagination
  skip: 0,
});

// ❌ BAD - Load everything
const records = await this.prisma.op.findMany({
  where: { tableId },
});
```

### Caching Strategy

```typescript
// Use Redis for frequently accessed data
async getTable(tableId: string): Promise<TableMeta> {
  // Check cache first
  const cached = await this.redis.get(`table:${tableId}`);
  if (cached) return JSON.parse(cached);

  // Query database
  const table = await this.prisma.tableMeta.findUnique({
    where: { id: tableId },
  });

  // Store in cache (1 hour TTL)
  await this.redis.set(
    `table:${tableId}`,
    JSON.stringify(table),
    'EX',
    3600,
  );

  return table;
}
```

### Bull MQ for Async Jobs

```typescript
// Long-running operations → Bull queue
@Injectable()
export class EnrichmentProcessor {
  @Process()
  async processEnrichment(job: Job) {
    const { recordId, fields } = job.data;
    
    // This runs in background
    for (const provider of this.providers) {
      try {
        const enriched = await provider.enrich(fields);
        await this.recordService.update(recordId, enriched);
        break; // Success, stop trying other providers
      } catch (error) {
        // Try next provider (waterfall strategy)
        continue;
      }
    }
  }
}
```

---

## Acceptance Criteria (All Backend Rules)

- [ ] All services follow separation of concerns
- [ ] No business logic in controllers
- [ ] All functions have proper type annotations
- [ ] All inputs validated with DTOs
- [ ] Error handling with proper HTTP exceptions
- [ ] Database transactions for multi-table operations
- [ ] WebSocket events broadcast correctly
- [ ] At least 80% test coverage
- [ ] No circular dependencies
- [ ] Performance optimized (queries under 100ms)
- [ ] Documentation in README.md

