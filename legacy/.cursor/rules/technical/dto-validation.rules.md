# DTO & Validation Rules
**CURSOR: TECH-DTO-001 through TECH-DTO-005**

## TECH-DTO-001: DTO Definition & Structure (CRITICAL)
**Priority:** CRITICAL | Status: Baseline | Module: `backend/src/features/{feature}/dto/`

### Purpose
Enforce strict DTO patterns for type-safe input/output validation.

### File Structure

```
backend/src/features/{feature}/dto/
├── create-{feature}.dto.ts         # POST request body
├── update-{feature}.dto.ts         # PATCH request body
├── {feature}.response.dto.ts       # Response body
└── {feature}.query.dto.ts          # Query parameters (optional)
```

### DTO Pattern (MANDATORY)

```typescript
// CURSOR: TECH-DTO-001 - Create DTO Pattern

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// 1. Define Zod schema (validation rules)
const createRecordSchema = z.object({
  // ✅ REQUIRED fields
  tableId: z
    .string()
    .uuid('Must be valid UUID')
    .describe('Table ID'),
  
  // ✅ OPTIONAL fields
  cellValues: z
    .record(z.string(), z.any().optional())
    .optional()
    .default({})
    .describe('Dynamic field values'),
  
  // ✅ STRING validation
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name too long')
    .trim(),
  
  // ✅ NUMBER validation
  age: z
    .number()
    .int('Must be integer')
    .min(0, 'Age cannot be negative')
    .max(150, 'Age too high'),
  
  // ✅ EMAIL validation
  email: z
    .string()
    .email('Invalid email format'),
  
  // ✅ ENUM validation
  status: z
    .enum(['active', 'archived', 'draft'])
    .default('draft'),
  
  // ✅ ARRAY validation
  tags: z
    .array(z.string())
    .min(1, 'At least one tag required'),
  
  // ✅ NESTED validation
  metadata: z.object({
    createdBy: z.string().uuid(),
    source: z.string(),
  }).optional(),
});

// 2. Create DTO class (extends schema)
export class CreateRecordDTO extends createZodDto(createRecordSchema) {}

// 3. Export schema for reuse (if needed)
export type CreateRecordInput = z.infer<typeof createRecordSchema>;
```

### Response DTO Pattern

```typescript
// CURSOR: TECH-DTO-001 - Response DTO Pattern

export class RecordResponseDTO {
  id: string;
  tableId: string;
  cellValues: Record<string, any>;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Record) {
    this.id = data.id;
    this.tableId = data.tableId;
    this.cellValues = data.cellValues;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
```

### Query DTO Pattern (for GET params)

```typescript
// CURSOR: TECH-DTO-001 - Query DTO Pattern

const querySchema = z.object({
  page: z
    .number()
    .int()
    .min(1)
    .default(1)
    .describe('Page number'),
  
  limit: z
    .number()
    .int()
    .min(1)
    .max(1000)
    .default(100)
    .describe('Items per page'),
  
  sortBy: z
    .string()
    .optional()
    .describe('Field to sort by'),
  
  sortOrder: z
    .enum(['asc', 'desc'])
    .default('asc'),
  
  search: z
    .string()
    .optional()
    .describe('Search term'),
});

export class RecordQueryDTO extends createZodDto(querySchema) {}
```

### Best Practices (MANDATORY)

1. **Descriptive Schemas**
   ```typescript
   // ✅ GOOD - Clear descriptions
   z.string().describe('User email address for login')
   
   // ❌ BAD - No description
   z.string()
   ```

2. **Default Values**
   ```typescript
   // ✅ GOOD - Explicit defaults
   z.string().default('draft')
   
   // ❌ BAD - No defaults (forces all optional)
   z.string().optional()
   ```

3. **Custom Error Messages**
   ```typescript
   // ✅ GOOD - User-friendly messages
   z.string().min(3, 'Name must be at least 3 characters')
   
   // ❌ BAD - Generic errors
   z.string().min(3)
   ```

---

## TECH-DTO-002: Validation Pipeline (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Three-Layer Validation

```typescript
// CURSOR: TECH-DTO-002 - Validation Pipeline

// Layer 1: DTO Validation (ZodValidationPipe - AUTOMATIC)
@Controller('records')
export class RecordController {
  @Post()
  async create(
    @Body() dto: CreateRecordDTO  // ← Automatically validated by pipe
  ) {
    // At this point, DTO is guaranteed valid
    // If invalid, 400 error thrown automatically
  }
}

// Layer 2: Business Logic Validation (Service)
@Injectable()
export class RecordService {
  async create(dto: CreateRecordDTO): Promise<Record> {
    // 1. Validate existence (table, permissions, etc.)
    const table = await this.repository.getTable(dto.tableId);
    if (!table) {
      throw new BadRequestException(
        'Table not found',
        'TABLE_NOT_FOUND'
      );
    }

    // 2. Validate field types
    for (const [fieldId, value] of Object.entries(dto.cellValues || {})) {
      const field = table.fields.find(f => f.id === fieldId);
      
      if (!field) {
        throw new BadRequestException(
          `Field ${fieldId} does not exist`,
          'INVALID_FIELD'
        );
      }

      // 3. Type validation
      if (!this.isValidValue(field.type, value)) {
        throw new BadRequestException(
          `Invalid value for field ${field.name}`,
          'INVALID_VALUE'
        );
      }
    }

    return this.repository.create(dto);
  }

  private isValidValue(fieldType: string, value: any): boolean {
    switch (fieldType) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'date':
        return !isNaN(Date.parse(value));
      default:
        return true;
    }
  }
}

// Layer 3: Database Constraints (Prisma)
// ✅ Unique constraints
// ✅ Foreign key constraints
// ✅ NOT NULL constraints
```

---

## TECH-DTO-003: Pagination DTOs (HIGH)
**Priority:** HIGH | Status: Baseline

### Standard Pagination Pattern

```typescript
// CURSOR: TECH-DTO-003 - Pagination

const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(1000).default(100),
});

export class PaginationDTO extends createZodDto(paginationSchema) {}

// Response format
export class PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(data: T[], page: number, limit: number, total: number) {
    this.data = data;
    this.pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}

// Controller usage
@Get()
async list(@Query() query: PaginationDTO) {
  const skip = (query.page - 1) * query.limit;
  const [records, total] = await Promise.all([
    this.repository.find({ skip, take: query.limit }),
    this.repository.count(),
  ]);
  
  return new PaginatedResponse(records, query.page, query.limit, total);
}
```

---

## TECH-DTO-004: Filter & Sort DTOs (HIGH)
**Priority:** HIGH | Status: Baseline

### Filter Pattern

```typescript
// CURSOR: TECH-DTO-004 - Filtering

const filterSchema = z.object({
  field: z.string().describe('Field name to filter'),
  operator: z.enum(['eq', 'ne', 'gt', 'lt', 'gte', 'lte', 'contains', 'in']),
  value: z.any().describe('Filter value'),
});

const filtersSchema = z.array(filterSchema).optional();

export class FilterDTO extends createZodDto(filterSchema) {}

// Service implementation
async findFiltered(filters: FilterDTO[]): Promise<Record[]> {
  if (!filters || filters.length === 0) {
    return this.repository.findAll();
  }

  let query = this.prisma.op;

  for (const filter of filters) {
    switch (filter.operator) {
      case 'eq':
        query = query.where({ [filter.field]: filter.value });
        break;
      case 'ne':
        query = query.where({ [filter.field]: { not: filter.value } });
        break;
      case 'gt':
        query = query.where({ [filter.field]: { gt: filter.value } });
        break;
      case 'contains':
        query = query.where({
          [filter.field]: { contains: filter.value }
        });
        break;
      case 'in':
        query = query.where({
          [filter.field]: { in: Array.isArray(filter.value) ? filter.value : [filter.value] }
        });
        break;
    }
  }

  return query.findMany();
}
```

### Sort Pattern

```typescript
// CURSOR: TECH-DTO-004 - Sorting

const sortSchema = z.object({
  field: z.string(),
  order: z.enum(['asc', 'desc']).default('asc'),
});

export class SortDTO extends createZodDto(sortSchema) {}

// Query DTO with sort
const querySchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Service implementation
async findSorted(sortBy: string, sortOrder: 'asc' | 'desc'): Promise<Record[]> {
  if (!sortBy) {
    return this.repository.findAll();
  }

  return this.prisma.op.findMany({
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
}
```

---

## TECH-DTO-005: Error Response DTOs (CRITICAL)
**Priority:** CRITICAL | Status: Baseline

### Standard Error Response

```typescript
// CURSOR: TECH-DTO-005 - Error Response

export interface ErrorResponse {
  data: null;
  error: {
    message: string;           // User-friendly message
    code: string;              // Error code for frontend
    statusCode: number;        // HTTP status
    details?: Record<string, any>;  // Additional context
  };
  status: number;
}

// Success Response
export interface SuccessResponse<T> {
  data: T;
  error: null;
  status: number;
}

// HTTP Exception Filter
@Catch(BadRequestException, NotFoundException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const { message, error } = exception.getResponse() as any;

    response.status(status).json({
      data: null,
      error: {
        message: message || 'An error occurred',
        code: error || 'INTERNAL_ERROR',
        statusCode: status,
      },
      status,
    });
  }
}

// Throwing errors with codes
throw new BadRequestException(
  'User email already exists',
  'EMAIL_ALREADY_EXISTS'
);

throw new NotFoundException(
  'Record not found',
  'RECORD_NOT_FOUND'
);
```

---

## Acceptance Criteria (All DTO Rules)

- [ ] All inputs have DTOs
- [ ] All DTOs use Zod schema
- [ ] All validations have error messages
- [ ] All response DTOs typed
- [ ] Query/filter/sort DTOs separate
- [ ] Pagination DTO implemented
- [ ] Error responses formatted with codes
- [ ] No `any` types in DTOs

