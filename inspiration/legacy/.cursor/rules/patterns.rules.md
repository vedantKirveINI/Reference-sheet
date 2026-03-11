# Code Patterns & Conventions
**Reference guide for consistent code generation**

## NestJS Controller Pattern

```typescript
// CURSOR: PATTERNS-CONTROLLER
// Standard controller with proper error handling and WebSocket integration

import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { RolePermissionGuard } from 'src/guards/role-permission.guard';
import { ZodValidationPipe } from 'src/zod.validation.pipe';
import { MyService } from './my.service';
import { CreateMyDTO, UpdateMyDTO } from './dto';

@Controller('my-resource')
@UseGuards(RolePermissionGuard)
export class MyController {
  constructor(private readonly myService: MyService) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(CreateMyDTO)) dto: CreateMyDTO,
    @Req() req: any
  ) {
    try {
      const result = await this.myService.create(dto, req.user.id);
      return { data: result, error: null, status: 200 };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.myService.findOne(id);
    if (!result) {
      throw new NotFoundException('Resource not found');
    }
    return { data: result, error: null, status: 200 };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateMyDTO)) dto: UpdateMyDTO
  ) {
    const result = await this.myService.update(id, dto);
    return { data: result, error: null, status: 200 };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.myService.delete(id);
    return { data: null, error: null, status: 204 };
  }
}
```

---

## Service with Prisma Transaction Pattern

```typescript
// CURSOR: PATTERNS-SERVICE
// Service with proper transaction handling and event emission

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GatewayService } from 'src/gateway/gateway.service';

@Injectable()
export class MyService {
  constructor(
    private prisma: PrismaService,
    private gateway: GatewayService
  ) {}

  async create(dto: CreateMyDTO, userId: string) {
    // Use transaction for multi-step operations
    return await this.prisma.$transaction(async (tx) => {
      // Step 1: Create main record
      const record = await tx.myModel.create({
        data: {
          ...dto,
          userId,
          createdAt: new Date(),
        }
      });

      // Step 2: Create related records if needed
      // const related = await tx.otherModel.create({ ... });

      // Step 3: Emit event after successful creation
      this.gateway.emit('my-resource:created', { record });

      return record;
    }).catch(error => {
      // Transaction rolled back automatically
      console.error('Transaction failed:', error);
      throw new BadRequestException('Failed to create resource');
    });
  }

  async update(id: string, dto: UpdateMyDTO) {
    const updated = await this.prisma.myModel.update({
      where: { id },
      data: {
        ...dto,
        updatedAt: new Date(),
      }
    });

    this.gateway.emit('my-resource:updated', { 
      resourceId: id, 
      changes: dto 
    });

    return updated;
  }

  async delete(id: string) {
    // Soft delete pattern
    const deleted = await this.prisma.myModel.update({
      where: { id },
      data: { status: 'archived', updatedAt: new Date() }
    });

    this.gateway.emit('my-resource:deleted', { resourceId: id });
    return deleted;
  }
}
```

---

## WebSocket Gateway Pattern

```typescript
// CURSOR: PATTERNS-GATEWAY
// WebSocket gateway with room management

import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'v1',
  cors: { origin: '*' }
})
export class MyGateway {
  @SubscribeMessage('join-room')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() socket: Socket
  ) {
    socket.join(`room:${data.roomId}`);
    socket.emit('joined', { roomId: data.roomId });
  }

  @SubscribeMessage('my-event')
  handleMyEvent(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    // Process event
    const result = this.processEvent(data);

    // Broadcast to all clients in room
    this.server.to(`room:${data.roomId}`).emit('my-event:response', result);
  }

  // Emit from service
  emitToRoom(roomId: string, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }
}
```

---

## DTO with Zod Validation Pattern

```typescript
// CURSOR: PATTERNS-DTO
// Type-safe DTOs using Zod schema

import { z } from 'zod';

export const CreateMyDTOSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived']).default('active'),
  metadata: z.record(z.any()).optional(),
});

export type CreateMyDTO = z.infer<typeof CreateMyDTOSchema>;

export const UpdateMyDTOSchema = CreateMyDTOSchema.partial();
export type UpdateMyDTO = z.infer<typeof UpdateMyDTOSchema>;

// Usage in controller:
@Post()
async create(@Body(new ZodValidationPipe(CreateMyDTOSchema)) dto: CreateMyDTO) {
  // dto is type-safe and validated
}
```

---

## Error Handling Pattern

```typescript
// CURSOR: PATTERNS-ERROR
// Consistent error handling across API

import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';

// Validation error
if (!isValid(data)) {
  throw new BadRequestException('Invalid input data', 'VALIDATION_ERROR');
}

// Permission error
if (!hasPermission(user, resource)) {
  throw new UnauthorizedException('Insufficient permissions', 'FORBIDDEN');
}

// Not found error
if (!resource) {
  throw new NotFoundException('Resource not found', 'NOT_FOUND');
}

// Generic error
catch (error) {
  console.error('Operation failed:', error);
  throw new BadRequestException(error.message, 'OPERATION_FAILED');
}
```

---

## Pagination Pattern

```typescript
// CURSOR: PATTERNS-PAGINATION
// Standard pagination for list endpoints

export async function getPaginated<T>(
  query: any,
  findFn: (skip: number, take: number) => Promise<T[]>,
  countFn: () => Promise<number>
) {
  const limit = Math.min(parseInt(query.limit) || 100, 1000);
  const offset = Math.max(parseInt(query.offset) || 0, 0);

  const [items, total] = await Promise.all([
    findFn(offset, limit),
    countFn()
  ]);

  return {
    data: items,
    pagination: {
      limit,
      offset,
      total,
      hasMore: offset + limit < total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Usage:
@Get()
async list(@Query() query: any) {
  return getPaginated(
    query,
    (skip, take) => this.prisma.myModel.findMany({ skip, take }),
    () => this.prisma.myModel.count()
  );
}
```

---

## Filtering Pattern

```typescript
// CURSOR: PATTERNS-FILTER
// Complex filter building

export function buildFilterQuery(filter: FilterCondition[]): any {
  return filter.reduce((acc, condition) => {
    const { fieldId, operator, value } = condition;

    switch(operator) {
      case 'contains':
        return { ...acc, [fieldId]: { contains: value } };
      case 'equals':
        return { ...acc, [fieldId]: { equals: value } };
      case 'gt':
        return { ...acc, [fieldId]: { gt: value } };
      case 'gte':
        return { ...acc, [fieldId]: { gte: value } };
      case 'lt':
        return { ...acc, [fieldId]: { lt: value } };
      case 'lte':
        return { ...acc, [fieldId]: { lte: value } };
      case 'in':
        return { ...acc, [fieldId]: { in: value } };
      default:
        return acc;
    }
  }, {});
}

// Usage:
const records = await this.prisma.op.findMany({
  where: buildFilterQuery(filters),
  orderBy: sortBy,
  skip: offset,
  take: limit
});
```

---

## Batch Processing Pattern

```typescript
// CURSOR: PATTERNS-BATCH
// Efficient batch operations

export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 100
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }

  return results;
}

// Usage:
await batchProcess(
  recordIds,
  (recordId) => this.recordService.delete(recordId),
  100  // Process 100 at a time
);
```

---

## Caching Pattern

```typescript
// CURSOR: PATTERNS-CACHE
// Simple in-memory cache with TTL

class CacheService {
  private cache = new Map<string, { value: any; expires: number }>();

  set(key: string, value: any, ttlMs: number = 60000) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttlMs
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear(key: string) {
    this.cache.delete(key);
  }
}

// Usage:
const cacheKey = `field-config:${fieldId}`;
let config = this.cache.get(cacheKey);
if (!config) {
  config = await this.prisma.field.findUnique({ where: { id: fieldId } });
  this.cache.set(cacheKey, config, 300000); // 5 min TTL
}
```

---

## Testing Pattern

```typescript
// CURSOR: PATTERNS-TEST
// Unit test with mocks

describe('MyService', () => {
  let service: MyService;
  let prismaService: jest.Mocked<PrismaService>;
  let gatewayService: jest.Mocked<GatewayService>;

  beforeEach(async () => {
    prismaService = {
      myModel: {
        create: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      }
    } as any;

    gatewayService = {
      emit: jest.fn()
    } as any;

    service = new MyService(prismaService, gatewayService);
  });

  it('should create resource', async () => {
    const dto = { name: 'Test' };
    const result = { id: '1', ...dto };

    prismaService.myModel.create.mockResolvedValue(result);

    const created = await service.create(dto, 'user1');

    expect(created).toEqual(result);
    expect(gatewayService.emit).toHaveBeenCalledWith('my-resource:created', { record: result });
  });
});
```

---

## Common Checklist

Before completing any feature, verify:

- [ ] DTO validation with Zod
- [ ] Error handling with proper exception types
- [ ] WebSocket events emitted
- [ ] Prisma transaction for multi-step operations
- [ ] Soft delete pattern used (status: 'archived')
- [ ] Pagination for list endpoints
- [ ] Proper type annotations (no `any`)
- [ ] Request/response follow standard format
- [ ] Permissions checked with RolePermissionGuard
- [ ] Tests written for service methods
- [ ] Documentation/comments added for complex logic

