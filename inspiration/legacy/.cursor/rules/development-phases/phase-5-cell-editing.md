# Phase 5: Cell Editing
**HIGH | Duration: 3-4 days | Status: Not Started**

## 🎯 Phase Overview

Build inline cell editing:
- ✅ Click to edit cell
- ✅ Type detection (text, number, date, etc.)
- ✅ Input validation per field type
- ✅ Editor overlays for dropdowns/pickers
- ✅ Enter to confirm, Escape to cancel
- ✅ Tab to next cell
- ✅ Auto-save or manual save
- ✅ Error messages & validation feedback

**Why:** Essential for data entry and updates directly in the grid.

---

## 📚 Reference Analysis

### How Teable Does It
- Overlay editor positioned over canvas cell
- Type-specific editors (TextInput, DatePicker, etc.)
- Auto-focus on edit mode
- Keyboard shortcuts (Enter/Escape/Tab)
- Validation on submit
- Error tooltips
- Auto-expand for long text

### How Old Frontend Does It
- Handsontable editors
- Enter/Escape handling
- Tab navigation to next cell
- OUTE-DS components for dropdowns/pickers
- Error messages on invalid input

**What to Keep:**
- Tab to navigate between cells
- Escape to cancel edit
- Enter to confirm edit
- Validation before save
- Error message display

---

## 🛠️ Technical Implementation

### Editor Architecture

```typescript
interface IEditor {
  id: string;
  fieldType: FieldType;
  render(value: any, onChange: (val: any) => void): JSX.Element;
  validate(value: any): ValidationResult;
  format(value: any): string;
}

interface IEditorState {
  isEditing: boolean;
  row: number;
  col: number;
  value: any;
  error: string | null;
  isDirty: boolean;
}
```

### File Structure

```
packages/sdk/src/grid/
├── editors/
│   ├── CellEditor.ts           # Main editor dispatcher
│   ├── TextEditor.tsx
│   ├── NumberEditor.tsx
│   ├── DateTimeEditor.tsx
│   ├── CheckboxEditor.tsx
│   ├── SelectEditor.tsx
│   ├── MultiSelectEditor.tsx
│   ├── RatingEditor.tsx
│   ├── FileUploadEditor.tsx
│   ├── LinkEditor.tsx
│   └── index.ts
│
├── validators/
│   ├── TextValidator.ts
│   ├── NumberValidator.ts
│   ├── EmailValidator.ts
│   ├── URLValidator.ts
│   ├── PhoneValidator.ts
│   ├── DateValidator.ts
│   ├── RatingValidator.ts
│   └── index.ts
│
├── components/
│   ├── EditorOverlay.tsx        # Position & render editor
│   ├── EditorToolbar.tsx        # Confirm/Cancel buttons
│   └── EditorError.tsx          # Error message display
│
├── hooks/
│   ├── useCellEditor.ts
│   ├── useEditorKeyboard.ts
│   └── useEditorValidation.ts
│
└── types/
    └── editor.types.ts
```

---

## 📋 Rules Checklist

- [ ] **TECH-REACT-STRUCT-001** - Components follow 16-step order
- [ ] **TECH-REACT-STRUCT-002** - Hooks follow 13-step order
- [ ] All editors work by field type
- [ ] Validation implemented & enforced
- [ ] Keyboard shortcuts working (Enter, Escape, Tab)
- [ ] Auto-save or manual save
- [ ] Error messages displayed
- [ ] Overlay positioning correct
- [ ] No TypeScript errors

---

## 🚀 Implementation Prompt

```
## Build Cell Editing (Phase 5)

Inline cell editing with type-specific editors and validation.

### Context:
After Phase 4 (cell rendering), now add inline editing capability.
- Click cell to edit
- Type-specific editor overlays
- Validation on submit
- Error handling
- Keyboard navigation (Tab, Enter, Escape)

### Key Requirements:
- Type-specific editors (Text, Number, Date, Checkbox, Select, etc.)
- Input validation per field type
- Keyboard shortcuts:
  - Enter: Save edit
  - Escape: Cancel edit
  - Tab: Save & move to next cell
  - Shift+Tab: Save & move to previous cell
- Overlay positioning over canvas cell
- Auto-save or manual save
- Error messages & tooltips
- Auto-focus on edit mode
- Cancel editing without save
- No TypeScript errors
- All components follow 16-step structure
- All hooks follow 13-step structure

### Reference Files:
FROM TEABLE:
- Type-specific editor components
- Overlay positioning logic
- Keyboard event handling

FROM OLD FRONTEND:
- Handsontable editor patterns
- Tab navigation between cells
- Enter/Escape handling
- OUTE-DS component usage

### Task: Build Complete Cell Editing System

1. **CellEditor (editors/CellEditor.ts)**
   - Main dispatcher by field type
   - Get appropriate editor for field type
   - Manage editor lifecycle
   - Handle save/cancel

2. **Specific Editors (11 editors)**
   - TextEditor.tsx: Text input with validation
   - NumberEditor.tsx: Number input with min/max
   - DateTimeEditor.tsx: Date picker from OUTE-DS
   - CheckboxEditor.tsx: Checkbox toggle
   - SelectEditor.tsx: Dropdown from OUTE-DS
   - MultiSelectEditor.tsx: Multi-select dropdown
   - RatingEditor.tsx: Star rating picker
   - FileUploadEditor.tsx: File upload input
   - LinkEditor.tsx: URL/reference editor
   - FormulaEditor.tsx: Formula input (read-only display)
   - LookupEditor.tsx: Lookup field (read-only display)
   - RollupEditor.tsx: Rollup field (read-only display)

3. **Validators (7 validators)**
   - TextValidator: Min/max length, regex patterns
   - NumberValidator: Min/max value, decimals
   - EmailValidator: Valid email format
   - URLValidator: Valid URL format
   - PhoneValidator: Valid phone number
   - DateValidator: Valid date range
   - RatingValidator: Valid rating range (0-5)

4. **EditorOverlay (components/EditorOverlay.tsx)**
   - Position overlay over cell
   - Render appropriate editor
   - Handle positioning on scroll
   - Handle positioning at edges
   - Use 16-step component structure

5. **EditorToolbar (components/EditorToolbar.tsx)**
   - Confirm button (Enter)
   - Cancel button (Escape)
   - Error/warning messages
   - Use OUTE-DS Button component

6. **EditorError (components/EditorError.tsx)**
   - Display validation errors
   - Red text, icon
   - Tooltip-style display

7. **useCellEditor (hooks/useCellEditor.ts)**
   - Manage editing state
   - Handle value changes
   - Track dirty state
   - Handle save/cancel
   - Use 13-step hook structure

8. **useEditorKeyboard (hooks/useEditorKeyboard.ts)**
   - Listen for Enter, Escape, Tab keys
   - Navigate between cells (Tab/Shift+Tab)
   - Save/cancel edit
   - Prevent default browser behavior

9. **useEditorValidation (hooks/useEditorValidation.ts)**
   - Validate input value
   - Get validator for field type
   - Return validation result & error message
   - Real-time validation

### Implementation Details:

**Editor Lifecycle:**
```
1. User clicks cell
2. CellEditor determines field type
3. Appropriate editor overlays canvas
4. Editor auto-focuses
5. User enters data
6. On blur or Enter: validate
7. If valid: save to backend
8. If invalid: show error, stay in edit
9. Escape: discard changes, close editor
10. Tab: save, move to next cell
```

**Validation Flow:**
```
1. User submits (Enter or blur)
2. Get validator for field type
3. Run validation
4. If invalid: show error message, stay in edit
5. If valid: save to backend
6. On save success: close editor
7. On save error: show error message
```

**Keyboard Handling:**
```
Enter:        Save edit, close editor
Escape:       Cancel edit, close editor
Tab:          Save edit, move to next cell
Shift+Tab:    Save edit, move to previous cell
Ctrl+A:       Select all text (allow default)
Ctrl+C:       Copy (allow default)
Ctrl+V:       Paste (allow default)
```

**Positioning:**
```
1. Get cell pixel position
2. Offset by cell padding
3. Check bounds (doesn't go off-screen)
4. Position overlay absolutely
5. z-index above canvas
6. Focus on mount
```

**Styling:**
```
- Use CSS Modules for overlay
- Border: 2px solid #0066cc (OUTE-DS blue)
- Background: white
- Shadow: 0 2px 8px rgba(0,0,0,0.15)
- Padding: 4px
- Font: match cell font
```

### File Examples:

**TextEditor.tsx:**
```tsx
export const TextEditor = ({
  value,
  onChange,
  onSave,
  onCancel,
  fieldConfig
}: EditorProps) => {
  const [text, setText] = useState(value || '');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };
  
  const handleSave = async () => {
    const validator = new TextValidator(fieldConfig);
    const result = validator.validate(text);
    
    if (!result.valid) {
      setError(result.error);
      return;
    }
    
    try {
      await onSave(text);
    } catch (err) {
      setError(err.message);
    }
  };
  
  return (
    <div>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter value"
      />
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
};
```

**NumberEditor.tsx:**
```tsx
export const NumberEditor = ({ value, onChange, fieldConfig }: EditorProps) => {
  const [num, setNum] = useState<string>(String(value || ''));
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNum(val);
    
    const validator = new NumberValidator(fieldConfig);
    const result = validator.validate(val ? parseFloat(val) : null);
    
    if (!result.valid) {
      setError(result.error);
    } else {
      setError(null);
    }
  };
  
  // ... rest of implementation
};
```

### Acceptance Criteria:
- [ ] All 12 editor types work
- [ ] Text validation works
- [ ] Number validation works (min/max)
- [ ] Email validation works
- [ ] URL validation works
- [ ] Phone validation works
- [ ] Date validation works
- [ ] Rating validation works
- [ ] Click cell to edit
- [ ] Enter saves & closes
- [ ] Escape cancels edit
- [ ] Tab saves & moves to next
- [ ] Shift+Tab saves & moves to prev
- [ ] Error messages display
- [ ] Overlay positions correctly
- [ ] Auto-focus on edit
- [ ] Backend save works
- [ ] No TypeScript errors
```

---

## ✅ Acceptance Criteria

- [ ] All editor types work (12 editors)
- [ ] All validators work (7 validators)
- [ ] Click cell to edit
- [ ] Type data in editor
- [ ] Enter to save
- [ ] Escape to cancel
- [ ] Tab to next cell
- [ ] Validation enforced
- [ ] Error messages shown
- [ ] Overlay positions correct
- [ ] Auto-focus works
- [ ] Backend save works
- [ ] Real-time validation
- [ ] No TypeScript errors

## 📌 Next Phase

→ **Move to Phase 6: Selection & Interaction**
