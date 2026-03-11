# ODS Component Review - Improvement Roadmap

## Summary

Reviewed all ODS (Oute Design System) components against industry-leading design systems (Material UI, Chakra UI, Radix UI, Ant Design).

---

## Component Ratings

### Excellent (⭐⭐⭐⭐⭐) - 8 components
- TextField
- Tooltip
- Popover
- Tab
- Skeleton
- Icon
- Card
- Avatar

### Good (⭐⭐⭐⭐) - 9 components
- Button
- Switch
- Radio
- Autocomplete
- Drawer
- Chip
- LoadingButton
- Accordion
- ContextMenu

### Needs Work (⭐⭐⭐) - 2 components
- Checkbox
- Dialog

### Critical Issues (⭐⭐) - 1 component
- Alert

---

## Priority Fixes

### P0 - Critical (Fix Immediately)

#### 1. Alert - State Sync Bug
**File:** `src/module/ods/alert/src/index.jsx`
**Issue:** `open` prop is captured in useState only once. Subsequent `showAlert()` calls are ignored.
**Impact:** Users report "alerts not showing" - complete feature breakage.
**Fix:** Add useEffect to sync internal state with `open` prop changes.

```jsx
// Current (broken)
const [showSnackbar, setShowSnackbar] = useState(open);

// Fixed
const [showSnackbar, setShowSnackbar] = useState(open);
useEffect(() => {
  setShowSnackbar(open);
}, [open]);
```

---

### P1 - High (Fix Soon)

#### 2. Dialog - Theme Recreation on Every Render
**File:** `src/module/ods/dialog/src/index.jsx` (line 87)
**Issue:** `createTheme()` called inside component body - recreates theme on every render.
**Impact:** Performance degradation, unnecessary re-renders.
**Fix:** Hoist theme creation outside component or memoize with useMemo.

#### 3. Dialog - Accessibility Issue (hideBackdrop default)
**File:** `src/module/ods/dialog/src/index.jsx` (line 47)
**Issue:** `hideBackdrop = true` by default means modals have no overlay.
**Impact:** 
- Users can interact with content behind dialog
- Screen readers don't know focus moved
- Accidental destructive actions possible
**Fix:** Change default to `hideBackdrop = false`.

#### 4. Checkbox - State Sync Bug (Same as Alert)
**File:** `src/module/ods/checkbox/src/index.jsx`
**Issue:** Uses internal state initialized from `defaultChecked`, ignores `checked` prop updates.
**Fix:** Either make fully controlled (use `checked` prop) or sync state with useEffect.

---

### P2 - Medium (Code Quality)

#### 5. Button/LoadingButton - Duplicated Theme
**Files:** 
- `src/module/ods/button/src/index.jsx`
- `src/module/ods/loading-button/src/index.jsx`
**Issue:** Entire button theme definition duplicated in both files.
**Fix:** Extract shared theme to `shared-assets` or create `button-theme.js`.

#### 6. Dialog - Transition Component Recreation
**File:** `src/module/ods/dialog/src/index.jsx` (line 124-170)
**Issue:** `getTransitionComponent` creates a new forwardRef component on each call.
**Fix:** Memoize or define transition components statically.

#### 7. Drawer - Throttle Recreation
**File:** `src/module/ods/drawer/src/index.jsx` (line 92)
**Issue:** `throttle` function defined inside component, recreated each render.
**Fix:** Move to module scope or use useMemo/useCallback.

#### 8. ContextMenu - Throttle Recreation
**File:** `src/module/ods/context-menu/src/index.jsx` (line 88)
**Issue:** Same throttle recreation issue.
**Fix:** Same solution - move to module scope.

---

### P3 - Low (Polish)

#### 9. Tooltip - CSS Typo
**File:** `src/module/ods/tooltip/src/index.jsx` (line 28)
**Issue:** `color: "fff"` missing `#` symbol.
**Fix:** Change to `color: "#fff"`.

#### 10. Accordion - Dead Code
**File:** `src/module/ods/accordion/src/index.jsx` (lines 54-85)
**Issue:** Large block of commented-out code.
**Fix:** Remove commented code.

#### 11. Switch - Event Mutation
**File:** `src/module/ods/switch/src/index.jsx` (line 107)
**Issue:** Directly mutates `e.target.checked` which is fragile.
**Fix:** Create synthetic event or use different callback pattern.

#### 12. Missing forwardRef
**Components:** Checkbox, Radio (if ref needed)
**Issue:** No ref forwarding for form integration.
**Fix:** Wrap with forwardRef.

---

## Best Practices Observed (Keep Doing)

1. **Consistent theming** - All components use ThemeProvider with shared assets
2. **Good test IDs** - data-testid attributes on most components
3. **Proper MUI extension** - Leveraging MUI as base, not fighting it
4. **Variant support** - Good "black" variant across components
5. **Label integration** - ODSAdvancedLabel reused well across form components

---

## Recommended Architecture Improvements

### 1. Centralized Theme Management
Create a single theme context instead of ThemeProvider in every component. This would:
- Reduce bundle size
- Enable dynamic theme switching
- Simplify component code

### 2. Controlled vs Uncontrolled Pattern
Standardize across all form components:
- Support both controlled (`value`/`checked`) and uncontrolled (`defaultValue`/`defaultChecked`)
- Document which mode each component supports

### 3. PropTypes or TypeScript
Add type definitions for better DX and catch prop errors early.

---

## Canvas Code Quality Issues (Separate from ODS)

### High Impact
1. **Debounce bug** in ViewportBoundsChanged - causes lag on 50+ node workflows
2. **Silent failures** in loadModelJSON - canvas shows empty with no error

### Lower Priority
1. Large file size (1100+ lines) - makes maintenance harder
2. Missing safety checks on canvasRef methods

---

*Last updated: December 2024*
