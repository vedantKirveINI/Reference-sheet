# Expanded Record Component - Feature Plan

## 1. Architecture Overview

Build a **reusable expanded record component** that can be used from:

- **Grid View**: When clicking the expand row icon
- **Kanban View**: When clicking on a card

The component should display all fields of a record in a modal/drawer format, allowing users to view and edit record details in a focused interface.

---

## 2. Component Structure

```
src/components/expanded-record/
├── ExpandedRecord.tsx              # Main component (wrapper)
├── ExpandedRecordHeader.tsx        # Header with title, nav, actions
├── ExpandedRecordContent.tsx       # Content area with fields
├── ExpandedRecordField.tsx        # Individual field item
├── ExpandedRecordFooter.tsx       # Footer with Save/Cancel (optional)
├── ExpandedRecord.module.scss      # Styles
└── index.ts                        # Exports
```

---

## 3. Design Decisions

### Modal vs Drawer

- **Desktop**: Modal (like Teable and Sheets)
- **Mobile**: Drawer (bottom sheet)
- Use `ODSDialog` from oute-ds-dialog (consistent with existing modals)

### State Management

- **Option A**: Local state in component (like Sheets)
    - Pros: Simple, self-contained
    - Cons: Changes lost on close without save
- **Option B**: Global state (Zustand store)
    - Pros: Persists across navigation, can sync with grid/kanban
    - Cons: More complexity
- **Recommendation**: Start with Option A, add global state if needed

### Field Display

- Show all fields from current view (visible columns)
- Option to show/hide hidden fields (like Teable)
- Use existing field editors from `cell-level/editors`
- Layout: Vertical (label left, editor right) or horizontal (label top, editor bottom) based on width

### Navigation

- Prev/Next buttons (like Teable)
- Requires recordIds array from parent
- Grid: All visible records
- Kanban: Records in current stack or all records

### Actions

- Copy URL (if needed)
- Delete record
- Duplicate record
- History (future)
- Comments (future)

---

## 4. Integration Points

### Grid View

- Add `onRowExpand` callback to GridView props
- Handle expand icon click in row header
- Pass recordId and recordIds array
- Update MainPage to manage expanded record state

### Kanban View

- Use existing `setExpandRecordId` in KanbanProvider
- Update KanbanCard to call `setExpandRecordId` on click
- Render ExpandedRecord in KanbanProvider when `expandRecordId` is set

---

## 5. Field Editor Integration

- Reuse editors from `cell-level/editors`
- Map field types to editors (similar to `getEditor` function)
- Handle readonly state (view-only mode)
- Support validation and error display

---

## 6. Data Flow

```
User clicks expand
  ↓
Set recordId in state
  ↓
ExpandedRecord component mounts
  ↓
Fetch/use record data
  ↓
Render fields with editors
  ↓
User edits fields
  ↓
Track changes in local state
  ↓
User clicks Save
  ↓
Call onCellChange for each modified field
  ↓
Close modal
```

---

## 7. UI/UX Features

### Header

- **Title**: Record name (from primary field) or "Record {id}"
- **Navigation**: Prev/Next buttons (disabled at boundaries)
- **Actions**: Copy URL, Delete, Duplicate (dropdown menu)
- **Close**: X button

### Content

- Scrollable form layout
- Field items with:
    - Field icon
    - Field name
    - Required indicator (\*)
    - Editor component
- Hidden fields section (collapsible)
- Loading state while fetching record

### Footer (Optional)

- Save button (if using local state)
- Cancel button
- Or: Auto-save on blur (like Teable)

---

## 8. Responsive Behavior

- **Desktop (>768px)**: Modal, max-width ~900px
- **Tablet (768px-1024px)**: Modal, full width with padding
- **Mobile (<768px)**: Bottom drawer (like Teable on touch devices)

---

## 9. Implementation Phases

### Phase 1: Core Component

1. Create ExpandedRecord component structure
2. Implement modal wrapper with ODSDialog
3. Create header with title and close button
4. Create content area with field rendering
5. Integrate field editors

### Phase 2: Grid Integration

1. Add onRowExpand handler to GridView
2. Add expand icon click handler
3. Update MainPage to manage expanded record state
4. Pass recordIds array for navigation

### Phase 3: Kanban Integration

1. Update KanbanCard to call setExpandRecordId
2. Render ExpandedRecord in KanbanProvider
3. Pass recordIds from kanban context

### Phase 4: Navigation and Actions

1. Add Prev/Next navigation
2. Add Delete action
3. Add Duplicate action
4. Add Copy URL (if needed)

### Phase 5: Polish

1. Add hidden fields toggle
2. Add loading states
3. Add error handling
4. Add keyboard shortcuts (Escape to close, etc.)
5. Add animations/transitions

---

## 10. Technical Considerations

### Performance

- Lazy load field editors
- Memoize field components
- Virtualize if many fields

### Accessibility

- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

### Error Handling

- Handle missing record
- Handle field editor errors
- Show error messages

---

## 11. Code Patterns to Follow

- Use existing ODS components (ODSDialog, ODSButton, etc.)
- Follow 16-step component structure from rules
- Use SCSS modules for styling
- TypeScript for type safety
- Follow existing field editor patterns

---

## 12. Testing Considerations

- Test modal open/close
- Test field editing
- Test save/cancel
- Test navigation (prev/next)
- Test responsive behavior
- Test error states

---

## Summary

This plan provides:

1. ✅ A reusable component usable from both grid and kanban
2. ✅ Integration with existing field editors
3. ✅ Navigation between records
4. ✅ Actions (delete, duplicate, etc.)
5. ✅ Responsive design (modal on desktop, drawer on mobile)
6. ✅ Consistent with existing codebase patterns

The component will be similar to Teable's ExpandRecord but use ODS components and integrate with the existing field editor system.
