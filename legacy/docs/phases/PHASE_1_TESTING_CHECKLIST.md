# Phase 1 Testing Checklist

## Setup

- [ ] Feature flag `ENABLE_GROUPING_PLAYGROUND` is set to `true` in `src/config/grouping.ts`
- [ ] Dev server is running (`pnpm dev`)
- [ ] Browser console is open for debugging

## GroupBy Panel Component

- [ ] GroupBy panel renders correctly
- [ ] Can see "Group By" title and description
- [ ] "Add Group" button is visible
- [ ] Can click "Add Group" to open field picker
- [ ] Field picker shows available fields
- [ ] Can select a field from dropdown
- [ ] Selected field appears as a group row
- [ ] Can remove a group row (X button)
- [ ] Can change order (ASC/DESC toggle)
- [ ] Can add multiple groups (nested grouping)
- [ ] Validation works (shows error if invalid field selected)

## Grid Rendering

- [ ] Grid displays grouped rows with headers
- [ ] Group headers have correct background colors (different per depth)
- [ ] Group headers show field name
- [ ] Group headers show field value
- [ ] Group headers show collapse/expand icon (▶/▼)
- [ ] Records are grouped correctly under headers
- [ ] Nested groups render correctly (2+ levels)
- [ ] Group header heights are correct (40px)
- [ ] Group headers span full width of grid

## Collapse/Expand Functionality

- [ ] Can click on group header to collapse
- [ ] Collapsed group shows ▶ icon
- [ ] Collapsed group hides nested rows
- [ ] Can click again to expand
- [ ] Expanded group shows ▼ icon
- [ ] Nested groups collapse correctly when parent is collapsed
- [ ] Collapse state persists after page refresh (localStorage)

## Virtual Scrolling

- [ ] Can scroll through grouped rows
- [ ] Group headers scroll correctly
- [ ] Virtual scrolling accounts for group header heights
- [ ] Scrollbar height is correct (includes group headers in total)
- [ ] No visual glitches when scrolling

## Record Access

- [ ] Records display correctly under groups
- [ ] Cell values match expected data
- [ ] Selection still works with grouped rows
- [ ] Can click cells in grouped rows
- [ ] Can edit cells in grouped rows
- [ ] Keyboard navigation works (arrow keys, etc.)

## Edge Cases

- [ ] Empty groups (no records) display correctly
- [ ] All groups collapsed shows only headers
- [ ] All groups expanded shows all records
- [ ] Single-level grouping (no nesting) works
- [ ] Multiple nested levels (3+) work correctly
- [ ] Very long group values don't break layout

## Visual Styling

- [ ] Group header colors match design tokens
- [ ] Group header text is readable
- [ ] Group borders are visible
- [ ] Icons are properly sized and positioned
- [ ] Spacing/padding looks correct
- [ ] Group headers align with column headers

## Performance

- [ ] Grid renders smoothly with many groups
- [ ] No console errors
- [ ] No memory leaks (check with React DevTools)
- [ ] Transformation is fast (< 50ms for 1000+ rows)

## Integration

- [ ] Feature flag can be toggled on/off
- [ ] When flag is `false`, grid renders normally (no groups)
- [ ] When flag is `true`, groups appear
- [ ] No conflicts with existing features (selection, editing, etc.)

## Notes

- Test with different group configurations (1 field, 2 fields, 3 fields)
- Test with different data types (text, number, etc.)
- Verify that mock data structure matches expected format
- Check that all TypeScript types are correct (no `any` types)
