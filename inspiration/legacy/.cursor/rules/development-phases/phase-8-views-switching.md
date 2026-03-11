# Phase 8: Views Switching
**HIGH | Duration: 3-4 days | Status: Not Started**

## 🎯 Phase Overview

Multiple view types:
- ✅ Grid view (current)
- ✅ Form view
- ✅ Kanban view
- ✅ Calendar view
- ✅ Gallery view (optional)
- ✅ View tabs/switching
- ✅ View config persistence
- ✅ Filters & sorts per view

---

## 📚 Reference Analysis

### How Teable Does It
- Multiple view components
- View provider for state
- Tab switcher
- Unique config per view
- Data synced across views
- Switch view seamlessly

### How Old Frontend Does It
- Handsontable grid only
- No other views (yet)
- Tab bar for tables
- State management per table

**What to Keep:**
- Tab-based switching
- Individual view configs
- Data consistency

---

## 🛠️ Implementation

### View Architecture

```typescript
type ViewType = 'grid' | 'form' | 'kanban' | 'calendar' | 'gallery';

interface IViewConfig {
  id: string;
  name: string;
  type: ViewType;
  filters: Filter[];
  sorts: Sort[];
  groupBy?: string; // For kanban
  colorBy?: string; // For kanban
  // ... view-specific config
}

interface IViewData {
  config: IViewConfig;
  records: Record[];
  fields: Field[];
}
```

### File Structure

```
apps/web/src/features/spreadsheet/views/
├── GridView/
│   ├── GridView.tsx
│   ├── GridView.module.scss
│   └── hooks/
│
├── FormView/
│   ├── FormView.tsx
│   ├── FormField.tsx
│   ├── FormView.module.scss
│   └── hooks/
│
├── KanbanView/
│   ├── KanbanView.tsx
│   ├── KanbanColumn.tsx
│   ├── KanbanCard.tsx
│   ├── KanbanView.module.scss
│   └── hooks/
│
├── CalendarView/
│   ├── CalendarView.tsx
│   ├── CalendarDay.tsx
│   ├── CalendarView.module.scss
│   └── hooks/
│
└── ViewTabs/
    ├── ViewTabs.tsx
    ├── ViewTabs.module.scss
    └── useViewSwitcher.ts
```

---

## 📋 Rules Checklist

- [ ] **TECH-REACT-STRUCT-001** - Components follow 16-step order
- [ ] **TECH-REACT-STRUCT-002** - Hooks follow 13-step order
- [ ] All views render correctly
- [ ] Tab switching works
- [ ] View config saved
- [ ] Data consistent across views
- [ ] Filters apply per view
- [ ] Sorts apply per view
- [ ] No TypeScript errors

---

## 🚀 Implementation Prompt

```
## Build Views Switching (Phase 8)

Multiple view types (Grid, Form, Kanban, Calendar) with seamless switching.

### Context:
After Phase 7 (column/row operations), now add multiple view types.
- Tab switcher
- Form view for editing records
- Kanban view for status/grouping
- Calendar view for date fields
- View-specific filters & sorts

### Key Requirements:
- Grid view (current, from Phase 4)
- Form view: Vertical fields, record navigation
- Kanban view: Columns by grouping, cards
- Calendar view: Events by date
- View tabs: Click to switch
- View config persistence
- Filters per view
- Sorts per view
- Data consistency across views
- No TypeScript errors
- All components follow 16-step structure
- All hooks follow 13-step structure

### Reference Files:
FROM TEABLE:
- Multiple view implementations
- View provider pattern
- View switching logic

### Task: Build Multi-View System

1. **GridView** (existing, from Phase 4)
   - Reuse canvas grid component

2. **FormView (views/FormView/FormView.tsx)**
   - Vertical field layout
   - One record per "page"
   - Navigation prev/next record
   - Edit fields directly
   - Create new record button

3. **KanbanView (views/KanbanView/)**
   - Select grouping field
   - Create column per value
   - Drag cards between columns
   - Inline editing
   - Add new card button

4. **CalendarView (views/CalendarView/)**
   - Select date field
   - Show events on calendar
   - Click to edit event
   - Month/week/day views
   - Create event button

5. **ViewTabs (views/ViewTabs/)**
   - Tab for each view
   - Click to switch
   - Show active tab
   - Use OUTE-DS Tabs

6. **ViewSwitcher Hook**
   - Manage current view
   - Load view config
   - Save view config
   - Switch view seamlessly

### Acceptance Criteria:
- [ ] All 4 views render
- [ ] Tab switching works
- [ ] Forms work
- [ ] Kanban works
- [ ] Calendar works
- [ ] Data consistent
- [ ] Filters per view
- [ ] Sorts per view
- [ ] Responsive
```

---

## ✅ Acceptance Criteria

- [ ] All views implemented
- [ ] Tab switching works
- [ ] View configs saved
- [ ] Data consistent
- [ ] Responsive layout
- [ ] No TypeScript errors

## 📌 Next Phase

→ **Move to Phase 9: Real-time Sync**
