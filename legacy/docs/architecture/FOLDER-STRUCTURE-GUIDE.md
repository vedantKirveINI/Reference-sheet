# Folder Structure Guide - Quick Reference

This document provides a quick reference for the comprehensive folder structure used in the reference-sheet project.

## 🎯 How Cursor AI Uses This Structure

When you ask Cursor to create features, it will:
1. Check `.cursor/rules/folder-structure.rules.md` first
2. Place files in the correct directories
3. Follow naming conventions
4. Create appropriate imports

## 📂 Main Folder Categories

### 1. Pages (`/pages/`)
**3 Main Pages:**
- `/pages/welcome/` - Entry screen for creating/viewing sheets
- `/pages/ai-enrichment/` - AI enrichment configuration flow
- `/pages/sheets/` - Main sheets UI with tabs, views, and table management

### 2. Views (`/views/`)
**Different view types:**
- `/views/grid/` - Grid view (canvas-based)
- `/views/kanban/` - Kanban view (card-based)
- `/views/gallery/` - Gallery view
- `/views/chart/` - Chart view
- `/views/form/` - Form view
- `/views/calendar/` - Calendar view

### 3. Cell-Level (`/cell-level/`)
**Rendering, Editing, and Validation:**
- `/cell-level/renderers/` - Canvas cell renderers (by type)
- `/cell-level/editors/` - Cell editors (by type)
- `/cell-level/validators/` - Validation logic

### 4. Fields (`/fields/`)
**Field Management:**
- `/fields/components/` - Field creation, editing, configuration
- `/fields/hooks/` - Field-related hooks
- `/fields/services/` - Field API calls

### 5. Subheader (`/subheader/`)
**Filter, Sort, Group System:**
- `/subheader/filters/` - Filter system
- `/subheader/sorting/` - Sort system
- `/subheader/grouping/` - Group by system

### 6. Common (`/common/`)
**Reusable Utilities:**
- `/common/http/useRequest.ts` - HTTP request hook (from Sheets)
- `/common/forms/controllers/` - Form controllers (from Sheets)
- `/common/websocket/client.ts` - WebSocket client (from Sheets)

### 7. Shared Components (`/components/`)
- `/components/ui/` - Generic UI (Button, Input, Modal)
- `/components/layout/` - Layout components (Container, Sidebar)
- `/components/responsive/` - Mobile-specific components

## ✅ Validation Checklist

Before creating any feature, verify:

- [ ] Page-level code → `/pages/{page-name}/components/`
- [ ] View code → `/views/{view-name}/`
- [ ] Cell rendering → `/cell-level/renderers/{type}/`
- [ ] Cell editing → `/cell-level/editors/{type}/`
- [ ] Validation → `/cell-level/validators/`
- [ ] Reusable utilities → `/common/`
- [ ] Shared UI → `/components/ui/`
- [ ] State management → `/stores/`
- [ ] API calls → `/services/api/`
- [ ] Types defined in `/types/`

## 📝 Example Prompts

### Creating a Filter Component
```
"Create a filter button component in the subheader system that allows filtering by text field"
```

Cursor will create:
- File: `src/subheader/filters/FilterPanel.tsx`
- Import from: `@/common/http/useRequest`
- Import from: `@/common/forms/controllers/InputController`

### Creating a Cell Renderer
```
"Create a string cell renderer for the canvas grid"
```

Cursor will create:
- File: `src/cell-level/renderers/string/StringRenderer.tsx`
- Follows `IBaseCellRenderer` interface
- Includes `draw()` and `measure()` methods

### Creating a View
```
"Create a kanban view component with drag and drop"
```

Cursor will create:
- Files: `src/views/kanban/KanbanView.tsx`, `KanbanStack.tsx`, `KanbanCard.tsx`
- Import from: `@/hooks/view/useKanban`
- Import from: `@/types/view.types`

## 🔗 References

### From Teable (Reference Only)
- Canvas rendering patterns
- Cell renderer architecture
- View system structure

### From Sheets (Reference Only)
- Form controllers pattern
- HTTP request hooks
- WebSocket client
- Page structure organization

## 🚀 Next Steps

1. **Read the full structure**: `reference-sheet/.cursor/rules/folder-structure.rules.md`
2. **Start creating features**: Ask Cursor to create features following this structure
3. **Verify placement**: Check that files are in the correct directories
4. **Follow imports**: Use the import examples provided in the rule file

---

**Remember**: Always reference `folder-structure.rules.md` before creating new features!

