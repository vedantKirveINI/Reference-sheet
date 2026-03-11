# Cell Editor Pattern Reference

This document describes the standard pattern for creating cell editors in the reference-sheet project. Use this as a reference when implementing new cell editors.

## 📋 Table of Contents

1. [Core Principles](#core-principles)
2. [Editor Structure](#editor-structure)
3. [Saving Pattern](#saving-pattern)
4. [Positioning Pattern](#positioning-pattern)
5. [Keyboard Handling](#keyboard-handling)
6. [Event Handling](#event-handling)
7. [Reference Implementations](#reference-implementations)

---

## 🎯 Core Principles

### 1. **Immediate UI Feedback, Delayed Saving**

- ✅ Update **local state** immediately for instant UI feedback
- ❌ Do **NOT** call `onChange` on every change
- ✅ Call `onChange` **only on save events** (Enter/Tab/blur)

**Why?** This prevents full page re-renders during editing, improving performance.

### 2. **Consistent Positioning**

- All editors must align perfectly with cell renderers
- Use the same border alignment approach across all editors

### 3. **Event Isolation**

- Stop event propagation to prevent canvas scrolling/interaction
- Handle events within editor without affecting grid

---

## 📁 Editor Structure

### File Organization

```
cell-level/editors/
├── [cell-type]/
│   ├── [CellType]Editor.tsx      # Main editor component
│   ├── [CellType]Editor.module.css
│   ├── components/                # Sub-components (if needed)
│   │   ├── Component1.tsx
│   │   └── Component1.module.css
│   └── hooks/                     # Custom hooks (if needed)
│       └── use[CellType]Editor.ts
```

### Component Interface

```typescript
interface CellEditorProps {
	cell: ICell; // Cell data
	rect: { x: number; y: number; width: number; height: number }; // Position & size
	theme: IGridTheme; // Theme configuration
	isEditing: boolean; // Editing state
	onChange: (value: any) => void; // Called ONLY on save events
	onSave?: () => void; // Called after onChange
	onCancel?: () => void; // Called on Escape
	onEnterKey?: (shiftKey: boolean) => void; // Navigation callback
}
```

---

## 💾 Saving Pattern

### Pattern Overview

```typescript
// ✅ CORRECT: Update local state immediately, save only on save events
const [value, setValue] = useState(cell?.data || "");

const handleChange = (newValue: any) => {
	setValue(newValue); // ✅ Update local state immediately
	// ❌ Do NOT call onChange here
	// onChange will be called on save events (Enter/Tab/blur)
};

// Save events
const handleKeyDown = (e: React.KeyboardEvent) => {
	if (e.key === "Enter") {
		onChange(value); // ✅ Call onChange on save
		onSave?.();
	}
};

const handleBlur = () => {
	onChange(value); // ✅ Call onChange on save
	onSave?.();
};
```

### ❌ Anti-Pattern (Don't Do This)

```typescript
// ❌ WRONG: Calling onChange on every change
const handleChange = (newValue: any) => {
	setValue(newValue);
	onChange(newValue); // ❌ This causes full page re-renders!
};
```

### Reference Implementation

See `StringEditor.tsx` and `McqEditor.tsx` for complete implementations.

---

## 📐 Positioning Pattern

### Border Alignment

All editors must use this exact pattern for perfect alignment:

```typescript
const editorStyle: React.CSSProperties = {
	position: "absolute",
	left: `${rect.x}px`,
	top: `${rect.y}px`,
	width: `${rect.width + 4}px`, // Add 4px for 2px border on each side
	height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom
	marginLeft: -2, // Offset by border width to align with cell
	marginTop: -2, // Offset by border width to align with cell
	border: `2px solid ${theme.cellActiveBorderColor}`,
	boxSizing: "border-box",
	// ... other styles
};
```

**Why?** This ensures the editor border aligns perfectly with the cell border rendered on canvas.

---

## ⌨️ Keyboard Handling

### Standard Keyboard Events

```typescript
const handleKeyDown = useCallback(
	(e: React.KeyboardEvent) => {
		// Enter: Save and navigate to next cell
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			onChange(value); // Save value
			onSave?.(); // Close editor
			if (onEnterKey) {
				requestAnimationFrame(() => {
					onEnterKey(e.shiftKey); // Navigate
				});
			}
		}
		// Tab: Save and navigate
		else if (e.key === "Tab") {
			e.preventDefault();
			e.stopPropagation();
			onChange(value);
			onSave?.();
		}
		// Escape: Cancel editing
		else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			onCancel?.();
		}
	},
	[value, onChange, onSave, onCancel, onEnterKey],
);
```

### Multi-line Editors

For multi-line editors (like textarea), handle Shift+Enter:

```typescript
if (needsMultiLine) {
	// Enter (without Shift): Save and navigate
	if (keyCode === 13 && !shiftKey) {
		onChange(value);
		onSave?.();
		onEnterKey?.(false);
	}
	// Shift+Enter: Create new line (allow default behavior)
	else if (keyCode === 13 && shiftKey) {
		e.stopPropagation();
		// Allow default (creates new line)
	}
}
```

---

## 🖱️ Event Handling

### Blur Handling

```typescript
const handleBlur = useCallback(() => {
	// Use setTimeout to check focus after event propagation
	// This prevents blur when clicking inside editor
	setTimeout(() => {
		const activeElement = document.activeElement;
		if (containerRef.current?.contains(activeElement)) {
			// Focus is still within editor, don't blur
			return;
		}
		// Focus moved outside, save and close
		onChange(value);
		onSave?.();
	}, 0);
}, [value, onChange, onSave]);
```

### Mouse Event Handling

```typescript
const handleMouseDown = useCallback((e: React.MouseEvent) => {
	e.stopPropagation(); // Prevent event bubbling to grid
	// Don't preventDefault - allow normal interactions
}, []);
```

### Wheel Event Handling

For editors with scrollable content:

```typescript
useEffect(() => {
	if (!containerRef.current || !isEditing) return;

	const handleWheel = (e: WheelEvent) => {
		e.stopPropagation(); // Prevent canvas scrolling
		// Handle scrolling within editor
	};

	container.addEventListener("wheel", handleWheel, {
		capture: true,
		passive: false,
	});

	return () => {
		container.removeEventListener("wheel", handleWheel, { capture: true });
	};
}, [isEditing]);
```

---

## 📚 Reference Implementations

### 1. StringEditor (`string/StringEditor.tsx`)

- ✅ Simple text input/textarea
- ✅ Multi-line support
- ✅ Perfect saving pattern
- ✅ Complete event handling

### 2. McqEditor (`mcq/McqEditor.tsx`)

- ✅ Complex editor with sub-components
- ✅ Chips display
- ✅ Searchable option list
- ✅ Follows same saving pattern as StringEditor

### 3. NumberEditor (`number/NumberEditor.tsx`)

- ✅ Number-specific validation
- ✅ Follows same patterns

---

## ✅ Checklist for New Editors

When creating a new editor, ensure:

- [ ] Local state updates immediately for UI feedback
- [ ] `onChange` is called ONLY on save events (Enter/Tab/blur)
- [ ] Positioning matches StringEditor pattern (width+4, height+4, margin -2)
- [ ] Keyboard handling (Enter, Tab, Escape) implemented
- [ ] Blur handling with focus check
- [ ] Mouse event propagation stopped
- [ ] Wheel events handled (if scrollable)
- [ ] TypeScript types properly defined
- [ ] Comments explaining the pattern
- [ ] Matches StringEditor's structure

---

## 🎓 Example: Creating a New Editor

```typescript
/**
 * [CellType] Editor Component
 *
 * PATTERN REFERENCE: Follows the same pattern as StringEditor
 * Use this as a reference when creating new cell editors.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import type { ICell } from "@/types";

interface CellEditorProps {
	cell: ICell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

export const CellEditor: React.FC<CellEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	// PATTERN: Local state (updates immediately, doesn't call onChange)
	const [value, setValue] = useState(cell?.data || "");
	const containerRef = useRef<HTMLDivElement>(null);

	// PATTERN: Handle changes - update local state only
	const handleChange = useCallback((newValue: any) => {
		setValue(newValue);
		// ❌ Do NOT call onChange here
	}, []);

	// PATTERN: Keyboard handling - save on Enter/Tab
	const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			e.stopPropagation();
			onChange(value); // ✅ Save on Enter
			onSave?.();
			if (onEnterKey) {
				requestAnimationFrame(() => {
					onEnterKey(e.shiftKey);
				});
			}
		} else if (e.key === "Tab") {
			e.preventDefault();
			e.stopPropagation();
			onChange(value); // ✅ Save on Tab
			onSave?.();
		} else if (e.key === "Escape") {
			e.preventDefault();
			e.stopPropagation();
			onCancel?.();
		}
	}, [value, onChange, onSave, onCancel, onEnterKey]);

	// PATTERN: Blur handling - save on focus out
	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (containerRef.current?.contains(activeElement)) {
				return; // Focus still within editor
			}
			onChange(value); // ✅ Save on blur
			onSave?.();
		}, 0);
	}, [value, onChange, onSave]);

	// PATTERN: Prevent blur on click
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	// PATTERN: Positioning (matches StringEditor)
	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`,
		height: `${rect.height + 4}px`,
		marginLeft: -2,
		marginTop: -2,
		// ... other styles
	};

	return (
		<div
			ref={containerRef}
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
		>
			{/* Editor content */}
		</div>
	);
};
```

---

## 📝 Notes

- Always use `useCallback` for event handlers to prevent unnecessary re-renders
- Use `requestAnimationFrame` for navigation to ensure editor closes first
- Test with different cell types and edge cases
- Ensure accessibility (keyboard navigation, focus management)

---

**Last Updated:** Based on StringEditor and McqEditor implementations
**Maintained By:** Reference-sheet development team
