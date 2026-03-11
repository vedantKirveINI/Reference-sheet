# Cursor AI Rules - Modular Feature Specifications

This directory contains modular, Cursor-optimized rulespecs for the Sheet application. Each file focuses on a specific feature category and can be referenced independently.

## 📋 Structure Overview

```
cursor/
├── .cursorrules                 # Root-level conventions
├── README.md                    # This file
├── GETTING_STARTED.md           # Quick start guide
├── patterns.rules.md            # Code patterns & conventions
│
└── functional/                  # Feature-specific rulespecs
    ├── data-model.rules.md      # RULES-DATA-001 to 003
    ├── field-types.rules.md     # RULES-FIELD-001 to 002
    ├── views.rules.md           # RULES-VIEW-001 to 007
    ├── data-operations.rules.md # RULES-DATA-004 to 010
    └── relationships.rules.md   # RULES-REL-001 to 003
```

## 🎯 How to Use

### For Cursor AI Coding

When Cursor AI is generating code, reference the specific rule in comments:

```typescript
// CURSOR: RULES-DATA-001 - Workspace Management
// Reference the feature rule when implementing new code

export class WorkspaceService {
  // Implementation follows the pattern in RULES-DATA-001
}
```

### For Developers

1. **Find the Feature**: Locate the rule file for your feature category
2. **Read Requirements**: Review the Purpose, Features, and API Endpoints sections
3. **Follow Pattern**: Use the Implementation Pattern provided
4. **Verify Checklist**: Ensure all acceptance criteria are met before marking complete

### For Sprint Planning

1. Open the relevant rule file
2. Check the Status column (Complete, In Progress, Not Started, On Hold)
3. Review Priority (CRITICAL, HIGH, MEDIUM, LOW)
4. Pick features for sprint based on dependencies

---

## 📚 Feature Categories & Status

### Data Model (RULES-DATA-001 to 003)
**Status: ✓ Complete**
- Workspace management
- Base (container) management
- Table management

**Module**: `backend/src/features/space/`, `backend/src/features/base/`, `backend/src/features/table/`
**Reference**: `cursor/functional/data-model.rules.md`

### Field Types (RULES-FIELD-001 to 002)
**Status: ⏳ In Progress (50%)**
- 20 current field types (complete)
- 13 new field types (planned)
- Field options & metadata

**Module**: `backend/src/features/field/`, `backend/src/features/field/DTO/`
**Reference**: `cursor/functional/field-types.rules.md`

### Views (RULES-VIEW-001 to 007)
**Status: ⏳ In Progress (57%)**
- ✓ Grid view
- ✓ Form view
- ✗ Kanban view (Planned)
- ✗ Calendar view (Planned)
- ✗ Gallery view (Planned)
- ✓ Filters & Sorting
- ✓ View management

**Module**: `backend/src/features/view/`, `frontend/src/components/`
**Reference**: `cursor/functional/views.rules.md`

### Data Operations (RULES-DATA-004 to 010)
**Status: ⏳ In Progress (43%)**
- ✓ Record CRUD
- ✓ Import/Export
- ⏳ Batch operations
- ✗ Undo/Redo (Planned)
- ✓ Formula fields
- ⏳ Formula dependencies
- ✗ Advanced formulas (Planned)

**Module**: `backend/src/features/record/`, `backend/src/bullMq/`
**Reference**: `cursor/functional/data-operations.rules.md`

### Relationships (RULES-REL-001 to 003)
**Status: ✗ Not Started (0%)**
- ✗ Link fields
- ✗ Lookup fields
- ✗ Rollup fields

**Module**: `backend/src/features/field/`
**Reference**: `cursor/functional/relationships.rules.md`

### Code Patterns (patterns.rules.md)
**Reference Guide**
- NestJS controller pattern
- Service with transaction pattern
- WebSocket gateway pattern
- DTO validation pattern
- Error handling pattern
- Pagination, filtering, batch processing patterns
- Caching and testing patterns

### Folder Structure (folder-structure.rules.md)
**CRITICAL: Folder Organization**
- Complete folder hierarchy for all features
- Mandatory organization rules (pages, views, cell-level, fields, subheader, common)
- Import organization patterns
- File naming conventions
- Mobile responsiveness requirements
- Validation checklist for new features

**Reference**: `cursor/folder-structure.rules.md`

**When to use**: Before creating ANY new feature - ALWAYS check this first

---

## 🔍 Quick Reference

### API Response Format
All endpoints follow this standard:
```json
{
  "data": { /* response data */ },
  "error": null,
  "status": 200
}
```

### WebSocket Event Pattern
```typescript
socket.emit('entity:action', { id, changes });
// Examples:
socket.emit('record:created', { record });
socket.emit('table:updated', { tableId, changes });
socket.emit('field:deleted', { fieldId });
```

### Database Pattern
```prisma
model YourModel {
  id        String   @id @default(cuid())
  name      String
  status    String   @default("active")
  metadata  Json     @default("{}")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Validation Checklist
- [ ] Input validated with Zod DTO
- [ ] Permissions checked
- [ ] Database transaction used for multi-step
- [ ] WebSocket event emitted
- [ ] Error handling with proper exception
- [ ] Response follows standard format
- [ ] Pagination implemented (if list endpoint)
- [ ] Tests written

---

## 🚀 Implementation Workflow

### Starting a New Feature

1. **Read the Rule**
   ```bash
   # Find the rule for your feature
   grep -r "RULES-FEATURE-XXX" cursor/
   ```

2. **Review Pattern**
   - Read Implementation Pattern section
   - Check API Endpoints
   - Review Database Schema

3. **Create Code**
   - Use patterns.rules.md as template
   - Follow NestJS/React conventions
   - Add CURSOR comment: `// CURSOR: RULES-FEATURE-XXX`

4. **Test & Verify**
   - Run tests: `npm test`
   - Verify acceptance criteria
   - Check error cases

5. **Mark Complete**
   - Update status in rule: `(COMPLETE)`
   - Commit with reference: `git commit -m "Implement RULES-FEATURE-XXX"`

---

## 📊 Priority Matrix

### CRITICAL (MVP - Must Have)
- RULES-DATA-001 to 003 (Data model)
- RULES-FIELD-001 (Field types)
- RULES-VIEW-001 to 002 (Grid & Form)
- RULES-DATA-004 to 005 (CRUD, Import/Export)
- RULES-VIEW-006 (Filters & Sorting)

### HIGH (Should Have)
- RULES-VIEW-003 to 005 (Kanban, Calendar, Gallery)
- RULES-DATA-006 to 010 (Batch ops, Undo, Formulas)
- RULES-REL-001 to 003 (Relationships)
- Collaboration features
- Extended enrichment

### MEDIUM (Nice to Have)
- Mobile support
- Advanced integrations
- Global search
- Analytics dashboard

### LOW (Future)
- Plugins system
- Advanced workflow automation
- AI assistant
- Mobile native apps

---

## 🔗 Dependency Graph

```
RULES-DATA-001 to 003 (Data Model)
    ↓
RULES-FIELD-001 to 002 (Fields)
    ↓
RULES-DATA-004 (Records CRUD)
    ├─→ RULES-VIEW-001 to 002 (Grid & Form)
    ├─→ RULES-DATA-005 (Import/Export)
    ├─→ RULES-DATA-006 (Batch ops)
    └─→ RULES-DATA-008 (Formulas)
         ↓
RULES-DATA-009 (Formula Dependencies)

RULES-DATA-004 (Records)
    ↓
RULES-REL-001 (Link Fields)
    ├─→ RULES-REL-002 (Lookup Fields)
    └─→ RULES-REL-003 (Rollup Fields)

RULES-VIEW-001 to 002 (Basic Views)
    ↓
RULES-VIEW-003 to 005 (Advanced Views)
    ↓
RULES-VIEW-006 (Filters & Sorting)
```

---

## 🛠️ Common Tasks

### Add New Field Type
1. Update `RULES-FIELD-001` with new type
2. Add database mapping
3. Create cell value transformer
4. Update validation rules
5. Add frontend component

### Create New View Type
1. Update `RULES-VIEW-007` with new type
2. Add view configuration interface
3. Implement backend service
4. Create frontend component
5. Add WebSocket events

### Add New API Endpoint
1. Define DTO in relevant rule
2. Add endpoint to API Endpoints section
3. Follow PATTERNS-CONTROLLER pattern
4. Implement with proper error handling
5. Write tests

---

## 📝 File Format

Each rule file follows this structure:

```markdown
# Category Name
**CURSOR: RULES-CATEGORY-001 through RULES-CATEGORY-00X**

## RULES-CATEGORY-001: Feature Name (STATUS)
**Module:** Path to relevant code

### Purpose
What this feature does

### Requirements
- [x] Requirement 1
- [ ] Requirement 2

### API Endpoints
```
METHOD /api/v1/endpoint
```

### Implementation Pattern
```typescript
// Code example
```

### Database Schema
```prisma
// Prisma model
```

### WebSocket Events
```typescript
// Event examples
```
```

---

## 🤝 Contributing

When adding new rules:

1. Create new `.rules.md` file
2. Follow the structure above
3. Include working code examples
4. Reference existing patterns
5. Update this README
6. Update `.cursorrules` with reference

---

## 📖 Related Files

- `.cursorrules` - Root-level conventions and overview
- `RULESPEC.md` - Original comprehensive reference (consolidated into modular files)
- `requirement.md` - Product requirements document
- `analysis/PRODUCT_ANALYSIS.md` - Product deep-dive

---

## 💡 Tips for Cursor AI

When asking Cursor to implement a feature:

```
"Implement RULES-VIEW-003 - Kanban View following the patterns in cursor/patterns.rules.md"

Cursor will:
1. Read cursor/views.rules.md for feature spec
2. Reference patterns.rules.md for code patterns
3. Generate code with proper structure
4. Include CURSOR comment for traceability
```

---

**Last Updated**: October 2025
**Total Rules**: 35+
**Completion Status**: 57.5%
