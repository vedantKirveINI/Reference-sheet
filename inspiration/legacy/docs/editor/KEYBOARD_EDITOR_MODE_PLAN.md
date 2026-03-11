# Keyboard-Triggered Editor Mode Implementation Plan

## Overview
Implement a feature where pressing any keyboard key on a cell opens the editor mode, except for special shortcuts, hotkeys, and read-only cells.

## Current State Analysis

### Existing Keyboard Handling
1. **Navigation Keys** (Arrow keys, Tab, Enter, Shift+Enter, PageUp/Down)
   - Currently handled by `useKeyboardNavigation` hook
   - Arrow keys: Move selection
   - Tab/Shift+Tab: Horizontal navigation
   - Enter: Opens editor OR navigates down (if already editing)
   - Shift+Enter: Navigates up (if already editing)
   - PageUp/Down: Scroll viewport

2. **Special Keys**
   - **F2**: Opens editor (explicit edit trigger)
   - **Escape**: Closes editor
   - **Delete/Backspace**: Clears cell content (when not editing)
   - **Space**: Row expand (in Teable, but not in our codebase yet)

3. **Modifier Shortcuts**
   - **Ctrl/Cmd + C**: Copy
   - **Ctrl/Cmd + V**: Paste
   - **Ctrl/Cmd + A**: Select all
   - **Ctrl/Cmd + Z**: Undo (future)
   - **Ctrl/Cmd + Shift + Z / Y**: Redo (future)

4. **Current Editor Opening Methods**
   - Double-click on cell
   - Press Enter (when not editing)
   - Press F2

## Keys Classification

### ✅ KEYS THAT SHOULD OPEN EDITOR (Printable Keys)

These are keys that should trigger editor mode when pressed on a cell:

1. **Alphabetic Characters**: A-Z, a-z
2. **Numeric Characters**: 0-9 (both regular and numpad)
3. **Symbols & Punctuation**:
   - `! @ # $ % ^ & * ( ) - _ + =`
   - `[ ] { } \ | ; : ' " , . < > / ?`
   - `` ` ~ ``
4. **Special Characters**: 
   - Space (but see exception below)
   - Plus (+), Minus (-), Equals (=)
   - Multiply (*), Divide (/)
   - Other printable Unicode characters

### ❌ KEYS THAT SHOULD NOT OPEN EDITOR

#### 1. Navigation Keys (Already Handled)
- **Arrow Keys** (↑ ↓ ← →): Move selection
- **Tab / Shift+Tab**: Horizontal navigation
- **Enter / Shift+Enter**: Already has special behavior (open editor OR navigate)
- **PageUp / PageDown**: Scroll viewport
- **Home / End**: (Future: jump to start/end of row)
- **Ctrl/Cmd + Arrow**: Jump to edges

#### 2. Modifier Key Combinations
- **Ctrl/Cmd + [any key]**: All Ctrl/Cmd combinations should be excluded
  - Examples: Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+Z, Ctrl+X, etc.
- **Alt + [any key]**: All Alt combinations should be excluded
  - Examples: Alt+Tab (OS-level), Alt+F4, etc.
- **Shift + [non-printable]**: Shift with navigation keys
  - Examples: Shift+Arrow (expand selection), Shift+Tab, Shift+Enter

#### 3. Function Keys
- **F1-F12**: All function keys (except F2 which already opens editor)
  - F1: Help (future)
  - F2: Edit (already implemented - keep as is)
  - F3-F12: Reserved for future features

#### 4. Special Action Keys
- **Escape**: Close editor (already implemented)
- **Delete / Backspace**: Clear cell (when not editing - already implemented)
- **Insert**: (Future: toggle insert/overwrite mode)

#### 5. System Keys
- **PrintScreen**: OS-level screenshot
- **Scroll Lock**: (Rarely used)
- **Pause/Break**: (Rarely used)

#### 6. Space Key Exception
- **Space**: Should NOT open editor if it's used for row expansion (like Teable)
- **Decision**: Check if Space is used for row expansion feature
  - If YES: Exclude Space from editor triggers
  - If NO: Include Space as printable key

#### 7. IME Composition Keys
- **Keys during IME composition**: Should not trigger editor
  - Check `event.isComposing` flag
  - Common for Chinese, Japanese, Korean input methods

## Implementation Strategy

### Phase 1: Create `isPrintableKey` Utility Function

**Location**: `reference-sheet/src/utils/keyboard.ts` (new file)

**Function**: Similar to Teable's implementation but adapted for our codebase

```typescript
export const isPrintableKey = (event: KeyboardEvent | React.KeyboardEvent): boolean => {
  const nativeEvent = 'nativeEvent' in event ? event.nativeEvent : event;
  const { keyCode, key, metaKey, ctrlKey, altKey } = nativeEvent;
  
  // Exclude modifier keys
  if (metaKey || ctrlKey || altKey) return false;
  
  // Exclude navigation and special keys
  const excludedKeyCodes = [
    8,   // Backspace
    9,   // Tab
    13,  // Enter
    16,  // Shift
    17,  // Ctrl
    18,  // Alt
    19,  // Pause
    20,  // Caps Lock
    27,  // Escape
    33,  // Page Up
    34,  // Page Down
    35,  // End
    36,  // Home
    37,  // Arrow Left
    38,  // Arrow Up
    39,  // Arrow Right
    40,  // Arrow Down
    45,  // Insert
    46,  // Delete
    91,  // Left Meta (Windows)
    92,  // Right Meta (Windows)
    93,  // Context Menu
    112, // F1
    113, // F2 (handled separately)
    114, // F3
    // ... F4-F12
  ];
  
  if (excludedKeyCodes.includes(keyCode)) return false;
  
  // Check for printable characters
  // A-Z, a-z, 0-9, and common symbols
  if (keyCode >= 48 && keyCode <= 57) return true; // 0-9
  if (keyCode >= 65 && keyCode <= 90) return true; // A-Z
  if (keyCode >= 96 && keyCode <= 105) return true; // Numpad 0-9
  if (keyCode >= 186 && keyCode <= 222) return true; // Symbols
  
  // Check for space (with exception for row expansion)
  if (keyCode === 32) {
    // TODO: Check if space is used for row expansion
    // For now, include it as printable
    return true;
  }
  
  // Check for IME composition
  if ('isComposing' in nativeEvent && nativeEvent.isComposing) return false;
  
  // Single character keys (Unicode)
  if (key && key.length === 1 && !key.match(/[\u0000-\u001F\u007F-\u009F]/)) {
    return true;
  }
  
  return false;
};
```

### Phase 2: Identify Non-Editable Cell Types

**Location**: `reference-sheet/src/utils/keyboard.ts`

**Cell Types to Exclude**:
- **Formula**: Always read-only (computed)
- **Enrichment**: May be read-only (check `readOnly` flag)
- **Any cell with `readOnly: true`**: Check cell property

```typescript
export const NO_EDITING_CELL_TYPES = new Set([
  // Add cell types that should never open editor on keyboard press
  // Example: CellType.Formula (if it exists)
]);

export const shouldAllowKeyboardEdit = (
  cell: any,
  cellType: string
): boolean => {
  // Check if cell type is excluded
  if (NO_EDITING_CELL_TYPES.has(cellType)) return false;
  
  // Check if cell is read-only
  if (cell?.readOnly || cell?.readonly) return false;
  
  return true;
};
```

### Phase 3: Add Keyboard Handler to GridView

**Location**: `reference-sheet/src/views/grid/GridView.tsx`

**Implementation**:
1. Add `onKeyDown` handler to the grid container
2. Check if:
   - `activeCell` exists
   - `editingCell` is null (not already editing)
   - Key is printable (`isPrintableKey`)
   - Cell allows editing (`shouldAllowKeyboardEdit`)
3. If all conditions pass:
   - Set `editingCell` to open editor
   - Optionally clear cell value (like Teable does)

**Key Considerations**:
- Handler should have lower priority than existing hotkeys
- Use `react-hotkeys-hook` with appropriate priority/order
- Ensure it doesn't interfere with existing keyboard navigation

### Phase 4: Integration with Existing Hotkeys

**Priority Order** (from highest to lowest):
1. **Modifier Shortcuts** (Ctrl+C, Ctrl+V, etc.) - Highest priority
2. **Navigation Keys** (Arrow, Tab, Enter) - High priority
3. **Special Keys** (F2, Escape, Delete) - High priority
4. **Printable Keys** (A-Z, 0-9, symbols) - Lower priority (new)

**Implementation**:
- Use `react-hotkeys-hook` with `enabled` conditions
- Printable key handler should only run when:
  - No modifier keys are pressed
  - Not already editing
  - Active cell exists
  - Cell is not read-only

## Testing Checklist

### ✅ Test Cases

1. **Printable Keys Should Open Editor**
   - [ ] Press 'a' on cell → Editor opens
   - [ ] Press '1' on cell → Editor opens
   - [ ] Press '@' on cell → Editor opens
   - [ ] Press Space on cell → Editor opens (if not used for row expansion)

2. **Navigation Keys Should NOT Open Editor**
   - [ ] Press Arrow keys → Selection moves, editor does NOT open
   - [ ] Press Tab → Selection moves, editor does NOT open
   - [ ] Press Enter → Editor opens (existing behavior)
   - [ ] Press Shift+Enter → Navigates up (existing behavior)

3. **Modifier Shortcuts Should NOT Open Editor**
   - [ ] Press Ctrl+C → Copy works, editor does NOT open
   - [ ] Press Ctrl+V → Paste works, editor does NOT open
   - [ ] Press Ctrl+A → Select all works, editor does NOT open
   - [ ] Press Ctrl+Z → Undo works (if implemented), editor does NOT open

4. **Special Keys Should NOT Open Editor**
   - [ ] Press F2 → Editor opens (existing behavior)
   - [ ] Press Escape → Editor closes (existing behavior)
   - [ ] Press Delete → Cell clears, editor does NOT open
   - [ ] Press Backspace → Cell clears, editor does NOT open

5. **Read-Only Cells Should NOT Open Editor**
   - [ ] Press any printable key on read-only cell → Editor does NOT open
   - [ ] Press any printable key on Formula cell → Editor does NOT open

6. **Edge Cases**
   - [ ] Press key while already editing → Editor stays open, key goes to editor
   - [ ] Press key while no active cell → Nothing happens
   - [ ] Press key during IME composition → Editor does NOT open
   - [ ] Press key while focus is in input/textarea → Editor does NOT open

## Implementation Files

### New Files
1. `reference-sheet/src/utils/keyboard.ts` - Keyboard utility functions

### Modified Files
1. `reference-sheet/src/views/grid/GridView.tsx` - Add keyboard handler
2. `reference-sheet/src/hooks/useKeyboardNavigation.ts` - Ensure compatibility

## Risk Assessment

### Low Risk
- Adding new keyboard handler with proper conditions
- Using existing `editingCell` state management
- Following Teable's proven pattern

### Medium Risk
- Ensuring proper priority with existing hotkeys
- Handling IME composition correctly
- Space key behavior (if used for row expansion)

### Mitigation
- Test thoroughly with all keyboard combinations
- Use `react-hotkeys-hook` priority system
- Check `isComposing` flag for IME
- Make Space key behavior configurable

## Future Enhancements

1. **Configurable Behavior**: Allow users to customize which keys open editor
2. **Smart Defaults**: Remember last typed character and pre-fill editor
3. **Multi-cell Editing**: Support editing multiple cells with keyboard
4. **Keyboard Macros**: Support custom keyboard shortcuts

## References

- Teable Implementation: `teable/packages/sdk/src/components/grid/utils/hotkey.ts`
- Teable Editor Container: `teable/packages/sdk/src/components/grid/components/editor/EditorContainer.tsx`
- Current Navigation Hook: `reference-sheet/src/hooks/useKeyboardNavigation.ts`

