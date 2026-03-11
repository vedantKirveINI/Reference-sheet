# Cursor Rules - Getting Started Guide

## 🎯 What Are These Rules?

These are **Cursor-optimized feature specifications** broken down into modular files. Instead of one massive 1400+ line RULESPEC document, features are organized into focused files that Cursor AI can reference when generating code.

**Why?** Because:
- Cursor works better with focused, contextual information
- Easier to reference specific features without noise
- Better for code generation (less context = faster, smarter responses)
- Searchable by feature name or ID
- Easy to update status as features progress

---

## 📚 Files & What They Contain

### `.cursorrules` (3.9 KB)
**Root-level conventions** - Load this first
- Project overview
- Code organization
- Global patterns (API format, error handling, WebSocket patterns, etc.)
- Security & performance considerations

**When to use**: Starting new work, understanding project structure

### `cursor/README.md` (8.6 KB)
**Navigation hub** - Start here!
- Directory structure
- Feature status matrix
- Priority breakdown
- Dependency graph
- Quick reference (API format, WebSocket patterns)
- Implementation workflow

**When to use**: Planning sprints, finding related features, understanding dependencies

### `cursor/functional/data-model.rules.md` (5.3 KB)
**RULES-DATA-001 through RULES-DATA-003**
- Workspace (Space) management
- Base management
- Table management

**When to use**: Building data hierarchy, creating containers

### `cursor/functional/field-types.rules.md` (8.8 KB)
**RULES-FIELD-001 through RULES-FIELD-002**
- 20 current field types (text, number, email, date, select, etc.)
- 13 planned field types (link, rollup, AI field, etc.)
- Field configuration & options

**When to use**: Adding/modifying columns, supporting new data types

### `cursor/functional/views.rules.md` (10 KB)
**RULES-VIEW-001 through RULES-VIEW-007**
- Grid view (spreadsheet)
- Form view (data entry)
- Kanban view (card-based grouping) — Planned
- Calendar view (timeline events) — Planned
- Gallery view (visual cards) — Planned
- Filters & sorting
- View management

**When to use**: Building different visualization types

### `cursor/functional/data-operations.rules.md` (12 KB)
**RULES-DATA-004 through RULES-DATA-010**
- Record CRUD (create, read, update, delete)
- Import/Export (CSV, Excel, JSON)
- Batch operations (bulk update, delete)
- Undo/Redo functionality
- Formula fields (20+ functions)
- Formula dependencies
- Advanced formulas (50+ functions)

**When to use**: Working with data, calculations, bulk operations

### `cursor/functional/relationships.rules.md` (9.2 KB)
**RULES-REL-001 through RULES-REL-003**
- Link fields (many-to-many relationships)
- Lookup fields (query linked record values)
- Rollup fields (aggregate linked data)

**When to use**: Creating relationships between tables

### `cursor/patterns.rules.md` (11 KB)
**Code templates & conventions**
- NestJS controller pattern
- Service with Prisma transactions
- WebSocket gateway pattern
- DTO validation with Zod
- Error handling
- Pagination, filtering, batch processing
- Caching & testing

**When to use**: Writing new services/controllers, following project conventions

---

## 🚀 How to Use with Cursor AI

### Scenario 1: Implementing a New Feature

```
You: "Implement Kanban View following RULES-VIEW-003"

Cursor will:
1. ✓ Find RULES-VIEW-003 in cursor/views.rules.md
2. ✓ Read Purpose & Requirements
3. ✓ Use Implementation Pattern as template
4. ✓ Reference cursor/patterns.rules.md for controller/service structure
5. ✓ Generate code with proper error handling
6. ✓ Add // CURSOR: RULES-VIEW-003 comment for traceability
```

### Scenario 2: Following Code Conventions

```
You: "Create a new service following PATTERNS-SERVICE"

Cursor will:
1. ✓ Open cursor/patterns.rules.md
2. ✓ Find PATTERNS-SERVICE section
3. ✓ Use Prisma transaction pattern
4. ✓ Implement proper error handling
5. ✓ Emit WebSocket events
6. ✓ Follow dependency injection setup
```

### Scenario 3: Sprint Planning

```
You: "Show me high-priority features I should implement next"

Reference:
1. ✓ Open cursor/README.md
2. ✓ Check Feature Status Matrix
3. ✓ Look at Dependency Graph
4. ✓ Pick HIGH/CRITICAL items that have no dependencies

Recommended next priorities:
- RULES-VIEW-003 (Kanban View) - depends on RULES-VIEW-001 ✓
- RULES-VIEW-004 (Calendar View) - depends on RULES-VIEW-001 ✓
- RULES-REL-001 (Link Fields) - depends on RULES-DATA-004 ✓
```

### Scenario 4: Understanding a Specific Feature

```
You: "Show me how to implement Formula Fields (RULES-DATA-008)"

1. ✓ Open cursor/data-operations.rules.md
2. ✓ Find RULES-DATA-008 section
3. ✓ Review supported functions
4. ✓ Check implementation pattern
5. ✓ Look at API endpoints
6. ✓ Reference patterns.rules.md for service structure
```

---

## 📋 Standard Rule Structure

Each rule follows this format:

```markdown
## RULES-CATEGORY-001: Feature Name (STATUS)
**Module:** Path to relevant code

### Purpose
What this feature does

### Requirements
- [x] Requirement 1 (completed)
- [ ] Requirement 2 (pending)

### API Endpoints
```
POST   /api/v1/endpoint
GET    /api/v1/endpoint/:id
PATCH  /api/v1/endpoint/:id
DELETE /api/v1/endpoint/:id
```

### Implementation Pattern
```typescript
// Working code example following project conventions
```

### Database Schema
```prisma
// Prisma model for this feature
```

### WebSocket Events
```typescript
// Real-time event examples
```

### Configuration
```typescript
// Type definitions for feature configuration
```
```

---

## 🎯 Quick Reference Card

### Status Symbols
- ✓ **Complete** - Fully implemented
- ⏳ **In Progress** - Partially done
- ✗ **Not Started** - Planned but not started
- 🔧 **Reference** - Pattern/guide only

### Priority Levels
- 🔴 **CRITICAL** - MVP, must have
- 🟠 **HIGH** - Should have, high value
- 🟡 **MEDIUM** - Nice to have
- 🟢 **LOW** - Future enhancements

### Naming Convention
- **RULES-{CATEGORY}-{NUMBER}**
  - RULES-DATA-001, RULES-VIEW-003, RULES-REL-002
  - Used in code: `// CURSOR: RULES-DATA-001`

---

## 🔄 Development Workflow

### 1. **Planning Phase**
```
1. Read cursor/README.md (overview)
2. Check dependency graph
3. Verify prerequisites are complete
4. Pick features for sprint
```

### 2. **Implementation Phase**
```
1. Find rule in appropriate file (e.g., cursor/views.rules.md)
2. Review Purpose & Requirements
3. Follow Implementation Pattern
4. Use patterns.rules.md as template
5. Add CURSOR comment: // CURSOR: RULES-FEATURE-XXX
```

### 3. **Verification Phase**
```
1. Check all acceptance criteria
2. Verify error handling
3. Test WebSocket events
4. Run tests: npm test
5. Update rule status to (COMPLETE)
```

### 4. **Completion Phase**
```
1. Commit: git commit -m "Implement RULES-FEATURE-XXX"
2. Update rule status in file
3. Mark as ✓ Complete
4. Document in git commit message
```

---

## 💡 Best Practices

### ✅ DO

- ✓ Reference specific rules in code comments
- ✓ Use patterns.rules.md as template for new code
- ✓ Check dependency graph before starting feature
- ✓ Verify error handling matches PATTERNS-ERROR
- ✓ Emit WebSocket events per PATTERNS-GATEWAY
- ✓ Use Prisma transactions for multi-step operations
- ✓ Test error cases, not just happy path
- ✓ Update rule status as you progress

### ❌ DON'T

- ✗ Copy-paste without understanding the pattern
- ✗ Skip error handling
- ✗ Implement features with missing dependencies
- ✗ Add `any` types (use TypeScript properly)
- ✗ Skip validation (use Zod DTOs)
- ✗ Forget WebSocket events (real-time feature)
- ✗ Implement without reading the rule
- ✗ Mix different code styles

---

## 🛠️ Common Commands

### Find a rule
```bash
grep -r "Kanban View" cursor/
grep -r "RULES-VIEW-003" cursor/
```

### Search patterns
```bash
grep -r "PATTERNS-CONTROLLER" cursor/
grep -r "Implementation Pattern" cursor/
```

### Check status
```bash
grep -i "status\|complete\|progress" cursor/*.rules.md
```

### View file structure
```bash
head -20 cursor/views.rules.md
tail -10 cursor/patterns.rules.md
```

---

## 📞 When to Reference Each File

| Task | File |
|------|------|
| Starting a new project | `.cursorrules` |
| Finding what to work on | `cursor/README.md` |
| Building data model | `cursor/functional/data-model.rules.md` |
| Adding/modifying columns | `cursor/functional/field-types.rules.md` |
| Creating views (grid, form, etc.) | `cursor/functional/views.rules.md` |
| Working with data (CRUD, import, formula) | `cursor/functional/data-operations.rules.md` |
| Creating relationships | `cursor/functional/relationships.rules.md` |
| Writing new controllers/services | `cursor/patterns.rules.md` |
| Planning sprint | `cursor/README.md` (Priority Matrix) |
| Understanding dependencies | `cursor/README.md` (Dependency Graph) |

---

## 🚀 Getting Started Right Now

### 1. **First Time?**
```
1. Read this file (GETTING_STARTED.md) ← You are here
2. Read cursor/README.md (navigation & overview)
3. Skim cursor/.cursorrules (conventions)
```

### 2. **Ready to Implement?**
```
1. Find your feature in cursor/README.md feature matrix
2. Open the corresponding .rules.md file
3. Read Purpose & Requirements
4. Follow Implementation Pattern
5. Reference patterns.rules.md for code style
```

### 3. **Need a Specific Pattern?**
```
1. Open cursor/patterns.rules.md
2. Find PATTERNS-{WHAT_YOU_NEED}
3. Copy template
4. Fill in your specific details
```

### 4. **Sprint Planning?**
```
1. Open cursor/README.md
2. Check Feature Status Matrix
3. Review Priority Matrix
4. Check Dependency Graph
5. Pick features with status ✗ (Not Started) with HIGH priority
6. Verify all dependencies are ✓ (Complete)
```

---

## 📝 Rule Status Legend

When checking status of features:

```
✓ COMPLETE
  • Fully implemented
  • Tested and verified
  • Code in production
  • Acceptance criteria met

⏳ IN PROGRESS
  • Partially implemented
  • Still being worked on
  • Some acceptance criteria met
  • May have blockers

✗ NOT STARTED
  • Planned but not begun
  • Ready for development
  • May have dependencies

⏸ ON HOLD
  • Paused temporarily
  • Has blockers or dependencies
  • Will resume later
```

---

## 🤝 Contributing New Rules

If you need to add a new feature:

1. **Create new .rules.md file** following the naming convention
2. **Follow the standard structure** (Purpose, Requirements, Pattern, etc.)
3. **Include working code examples** (copy from actual code if possible)
4. **Reference existing patterns** from patterns.rules.md
5. **Update cursor/README.md** with new rule reference
6. **Update .cursorrules** with reference to new file

---

## ✨ Summary

This modular rulespec system provides:

✅ **Focused guidance** - Each file addresses specific features
✅ **Code templates** - patterns.rules.md provides working examples
✅ **Status tracking** - Know what's done, in progress, planned
✅ **Dependencies** - Understand what must be done first
✅ **Cursor-optimized** - Works great with Cursor AI code generation
✅ **Searchable** - Grep-friendly identifiers (RULES-CATEGORY-###)
✅ **Traceable** - Add rule ID in code comments for reference

---

**Ready to start coding? Pick a feature from cursor/README.md and begin! 🚀**
