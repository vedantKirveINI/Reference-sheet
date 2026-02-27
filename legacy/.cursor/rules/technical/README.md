# Technical Rules - Complete Reference

## 📚 All Technical Rules

This directory contains granular, context-specific technical rules that Cursor AI should apply when implementing features. Each rule file is focused on a specific technology or pattern.

### 🗂️ File Structure

```
cursor/technical/
├── README.md                           # This file
├── backend-architecture.rules.md       # Core NestJS patterns
├── dto-validation.rules.md            # ✨ NEW - DTO & validation
├── database-operations.rules.md       # ✨ NEW - Prisma, transactions, caching
├── realtime-websocket.rules.md        # ✨ NEW - WebSocket & real-time
├── react-components.rules.md          # ✨ NEW - React & feature modules
└── frontend-architecture.rules.md     # React grid & component structure
```

---

## 🔍 Rules by Category

### Backend (TECH-BACKEND-* & TECH-DB-* & TECH-DTO-* & TECH-WS-*)

**Core Architecture**
- `TECH-BACKEND-001`: NestJS Module Structure (Separation of Concerns)
- `TECH-BACKEND-002`: Prisma ORM & Database (Transactions, Type Safety)
- `TECH-BACKEND-003`: WebSocket & Real-time (Event-Driven)
- `TECH-BACKEND-004`: Error Handling & Validation
- `TECH-BACKEND-005`: Performance & Caching

**DTO & Validation** (TECH-DTO-001 to 005)
- `TECH-DTO-001`: DTO Definition & Structure
- `TECH-DTO-002`: Validation Pipeline (Three-layer validation)
- `TECH-DTO-003`: Pagination DTOs
- `TECH-DTO-004`: Filter & Sort DTOs
- `TECH-DTO-005`: Error Response DTOs

**Database Operations** (TECH-DB-001 to 006)
- `TECH-DB-001`: Transactions & Data Consistency
- `TECH-DB-002`: Query Optimization
- `TECH-DB-003`: JSON Field Storage
- `TECH-DB-004`: Migrations
- `TECH-DB-005`: Caching (Redis)
- `TECH-DB-006`: Soft Delete Pattern

**WebSocket & Real-time** (TECH-WS-001 to 004)
- `TECH-WS-001`: WebSocket Event Architecture
- `TECH-WS-002`: Event Naming & Structure
- `TECH-WS-003`: Room Management
- `TECH-WS-004`: Conflict Resolution

### Frontend (TECH-FRONTEND-* & TECH-REACT-*)

**Canvas Grid** (TECH-FRONTEND-001)
- `TECH-FRONTEND-001`: Canvas Grid Architecture
  - Virtual scrolling, hit detection, rendering loop

**React Components** (TECH-REACT-001 to 005)
- `TECH-REACT-001`: Feature Module Structure (Modular architecture)
- `TECH-REACT-002`: Custom Hooks (Logic encapsulation)
- `TECH-REACT-003`: State Management (Zustand)
- `TECH-REACT-004`: Performance Optimization (Memoization, code splitting)
- `TECH-REACT-005`: Mobile Responsiveness

**Other Frontend**
- `TECH-FRONTEND-002`: React Component Structure
- `TECH-FRONTEND-003`: State Management & Data Fetching
- `TECH-FRONTEND-004`: Performance & Best Practices

---

## 📋 Rules Summary Table

| Rule | Title | File | Priority |
|------|-------|------|----------|
| TECH-BACKEND-001 | NestJS Module Structure | backend-architecture.rules.md | CRITICAL |
| TECH-BACKEND-002 | Prisma ORM & Database | backend-architecture.rules.md | CRITICAL |
| TECH-BACKEND-003 | WebSocket & Real-time | backend-architecture.rules.md | CRITICAL |
| TECH-BACKEND-004 | Error Handling & Validation | backend-architecture.rules.md | CRITICAL |
| TECH-BACKEND-005 | Performance & Caching | backend-architecture.rules.md | HIGH |
| **TECH-DTO-001** | **DTO Definition & Structure** | **dto-validation.rules.md** | **CRITICAL** |
| **TECH-DTO-002** | **Validation Pipeline** | **dto-validation.rules.md** | **CRITICAL** |
| **TECH-DTO-003** | **Pagination DTOs** | **dto-validation.rules.md** | **HIGH** |
| **TECH-DTO-004** | **Filter & Sort DTOs** | **dto-validation.rules.md** | **HIGH** |
| **TECH-DTO-005** | **Error Response DTOs** | **dto-validation.rules.md** | **CRITICAL** |
| **TECH-DB-001** | **Transactions & Consistency** | **database-operations.rules.md** | **CRITICAL** |
| **TECH-DB-002** | **Query Optimization** | **database-operations.rules.md** | **CRITICAL** |
| **TECH-DB-003** | **JSON Field Storage** | **database-operations.rules.md** | **HIGH** |
| **TECH-DB-004** | **Migrations** | **database-operations.rules.md** | **CRITICAL** |
| **TECH-DB-005** | **Caching (Redis)** | **database-operations.rules.md** | **HIGH** |
| **TECH-DB-006** | **Soft Delete Pattern** | **database-operations.rules.md** | **HIGH** |
| **TECH-WS-001** | **WebSocket Event Architecture** | **realtime-websocket.rules.md** | **CRITICAL** |
| **TECH-WS-002** | **Event Naming & Structure** | **realtime-websocket.rules.md** | **CRITICAL** |
| **TECH-WS-003** | **Room Management** | **realtime-websocket.rules.md** | **CRITICAL** |
| **TECH-WS-004** | **Conflict Resolution** | **realtime-websocket.rules.md** | **HIGH** |
| TECH-FRONTEND-001 | Canvas Grid Architecture | frontend-architecture.rules.md | CRITICAL |
| TECH-FRONTEND-002 | React Component Structure | frontend-architecture.rules.md | CRITICAL |
| TECH-FRONTEND-003 | State Management & Data Fetching | frontend-architecture.rules.md | HIGH |
| TECH-FRONTEND-004 | Performance & Best Practices | frontend-architecture.rules.md | HIGH |
| **TECH-REACT-001** | **Feature Module Structure** | **react-components.rules.md** | **CRITICAL** |
| **TECH-REACT-002** | **Custom Hooks** | **react-components.rules.md** | **HIGH** |
| **TECH-REACT-003** | **State Management** | **react-components.rules.md** | **HIGH** |
| **TECH-REACT-004** | **Performance Optimization** | **react-components.rules.md** | **HIGH** |
| **TECH-REACT-005** | **Mobile Responsiveness** | **react-components.rules.md** | **HIGH** |

---

## 🎯 Quick Reference by Task

### Building a REST API Endpoint

1. **Module Structure** → `TECH-BACKEND-001`
2. **DTOs** → `TECH-DTO-001`, `TECH-DTO-002`
3. **Database** → `TECH-DB-001`, `TECH-DB-002`
4. **Error Handling** → `TECH-BACKEND-004`, `TECH-DTO-005`

**Example:**
```typescript
// CURSOR: TECH-BACKEND-001 - NestJS Module Structure
// CURSOR: TECH-DTO-001 - DTO Definition
// CURSOR: TECH-DB-001 - Transactions

@Controller('records')
export class RecordController {
  @Post()
  async create(@Body() dto: CreateRecordDTO) {
    // Pattern from TECH-BACKEND-001
  }
}
```

### Building a WebSocket Event Handler

1. **Event Architecture** → `TECH-WS-001`
2. **Event Naming** → `TECH-WS-002`
3. **Room Management** → `TECH-WS-003`
4. **Conflict Resolution** → `TECH-WS-004`

**Example:**
```typescript
// CURSOR: TECH-WS-001 - Gateway Pattern
// CURSOR: TECH-WS-002 - Event Naming

@SubscribeMessage('record:create')
async handleCreate(@ConnectedSocket() socket: Socket) {
  // Pattern follows TECH-WS-001
}
```

### Building a Feature Component

1. **Feature Module** → `TECH-REACT-001`
2. **Custom Hooks** → `TECH-REACT-002`
3. **State Management** → `TECH-REACT-003`
4. **Performance** → `TECH-REACT-004`
5. **Mobile** → `TECH-REACT-005`

**Example:**
```typescript
// CURSOR: TECH-REACT-001 - Feature Module Structure
// CURSOR: TECH-REACT-002 - Custom Hooks
// CURSOR: TECH-REACT-003 - Zustand Store

export const RecordDetailContainer = ({ recordId }: Props) => {
  // Pattern from TECH-REACT-001 & TECH-REACT-002
};
```

### Database Query

1. **Query Optimization** → `TECH-DB-002`
2. **Transactions** → `TECH-DB-001` (if multi-step)
3. **Caching** → `TECH-DB-005` (if frequently accessed)
4. **JSON Fields** → `TECH-DB-003` (if metadata)

---

## 🔗 Cross-References

### Functional Rule → Technical Rules Mapping

**RULES-DATA-004** (Record CRUD)
- Use `TECH-BACKEND-001` for module structure
- Use `TECH-DTO-001` for DTOs
- Use `TECH-DB-001` for transactions
- Use `TECH-DB-002` for query optimization

**RULES-VIEW-001** (Grid View)
- Use `TECH-FRONTEND-001` for canvas grid
- Use `TECH-REACT-001` for feature structure
- Use `TECH-REACT-004` for performance

**RULES-DATA-010** (Real-time Sync)
- Use `TECH-WS-001` for gateway
- Use `TECH-WS-002` for events
- Use `TECH-WS-003` for rooms

---

## ✅ Implementation Checklist

### Before Starting Code

- [ ] Read relevant Functional Rule (RULES-*)
- [ ] Read relevant Technical Rules (TECH-*)
- [ ] Review code examples in technical rules
- [ ] Understand acceptance criteria

### While Writing Code

- [ ] Follow file structure from technical rule
- [ ] Use code patterns as templates
- [ ] Include CURSOR comments with rule references
- [ ] Ensure type safety (no `any`)
- [ ] Add error handling per rule

### Before Submitting PR

- [ ] All acceptance criteria met
- [ ] Code follows module structure
- [ ] No violations of best practices
- [ ] Tests written (80%+ coverage)
- [ ] Performance verified (queries <100ms)

---

## 📖 Key Principles

### 1. **Separation of Concerns**
- Controllers: HTTP layer only
- Services: Business logic only
- Repositories: Database layer only
- Components: Render only
- Hooks: Logic only
- Stores: State only

### 2. **Modularity**
- Each feature is independent
- No circular dependencies
- Clear public/private boundaries
- Reusable services and utilities

### 3. **Type Safety**
- All functions have return types
- All parameters are typed (no `any`)
- DTOs for all inputs
- Response DTOs for all outputs

### 4. **Performance**
- Backend queries < 100ms
- Frontend renders at 60fps
- Virtual scrolling for large data
- Caching for frequently accessed data

### 5. **Testing**
- Unit tests for services
- Integration tests for controllers
- 80%+ code coverage
- Mock external dependencies

---

## 🚀 Getting Started

### Step 1: Understand the Feature
Read the Functional Rule for your feature:
- `cursor/functional/*.rules.md`

### Step 2: Choose Technical Rules
Based on the feature type, select relevant technical rules from this directory.

### Step 3: Review Code Examples
Study the code examples in the technical rule files.

### Step 4: Follow the Pattern
Use the patterns as templates for your implementation.

### Step 5: Verify Quality
Check against acceptance criteria before submitting.

---

## 💡 Common Patterns

### Backend Pattern
```
DTO Definition
    ↓
Validation (3-layer)
    ↓
Controller (HTTP)
    ↓
Service (Business Logic)
    ↓
Repository (Database)
    ↓
WebSocket Event (Real-time Sync)
```

### Frontend Pattern
```
Feature Module
    ↓
Container Component
    ↓
Custom Hook
    ↓
Zustand Store
    ↓
Presentation Component
    ↓
Mobile Responsive
```

---

## 📞 Using These Rules

**For Cursor AI:**
```typescript
// Reference specific rules in code
// CURSOR: TECH-BACKEND-001 - NestJS Module Structure
// CURSOR: TECH-DTO-001 - DTO Definition
// CURSOR: TECH-DB-001 - Transactions
```

**For Code Review:**
- Check that module structure matches TECH rule
- Verify type safety (no `any`)
- Confirm error handling is present
- Ensure tests meet coverage

---

## 📊 Status

- ✅ TECH-BACKEND-001 to 005: Complete
- ✅ TECH-DTO-001 to 005: Complete
- ✅ TECH-DB-001 to 006: Complete
- ✅ TECH-WS-001 to 004: Complete
- ✅ TECH-FRONTEND-001 to 004: Complete
- ✅ TECH-REACT-001 to 005: Complete

**Total: 28 Technical Rules covering all major patterns**

---

**Last Updated:** 2025  
**Version:** 2.0 (Granular Rules)  
**Status:** Ready for Implementation
