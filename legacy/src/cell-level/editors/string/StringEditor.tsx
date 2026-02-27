// Cell editor for string type - Enhanced with multi-line support
// Inspired by Teable's TextEditor
import React, { useState, useEffect, useRef } from "react";
import { GRID_DEFAULT } from "@/config/grid";
import type { IStringCell } from "@/types";

interface StringEditorProps {
	cell: IStringCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: string) => void;
	onSave?: () => void;
	onCancel?: () => void;
	totalHeight?: number; // Optional: Full content height for multi-line cells
	onEnterKey?: (shiftKey: boolean) => void; // FIX ISSUE 1: Callback for Enter key to trigger navigation
}

const { cellHorizontalPadding, cellVerticalPaddingMD, cellVerticalPaddingSM, cellTextLineHeight } =
	GRID_DEFAULT;

export const StringEditor: React.FC<StringEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	totalHeight,
	onEnterKey, // FIX ISSUE 1: Callback for Enter key navigation
}) => {
	const [value, setValue] = useState(cell?.data || "");
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const inputRef = useRef<HTMLInputElement | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// OPTION B: Determine if we need multi-line (textarea) or single-line (input)
	// Use textarea if content has newlines, is long enough to wrap, or exceeds cell height
	// FIX: Improve multiline detection to handle long text without newlines
	const hasNewlines = value.includes("\n");

	// Calculate estimated lines based on actual text width (more accurate than character count)
	// Account for padding: available width = rect.width - (cellHorizontalPadding * 2)
	const availableWidth = rect.width - cellHorizontalPadding * 2;
	// Rough estimate: average character width is ~7px at 13px font size
	// But use a more conservative estimate to ensure we detect wrapping
	const avgCharWidth = 7;
	const estimatedCharsPerLine = Math.floor(availableWidth / avgCharWidth);
	const estimatedLines =
		estimatedCharsPerLine > 0
			? Math.ceil(value.length / estimatedCharsPerLine)
			: Math.ceil(value.length / 50); // Fallback to old method if width is too small

	// FIX: Always use textarea for long text (more than ~2 lines worth)
	// This ensures long pasted text is always visible
	const needsMultiLine =
		hasNewlines ||
		estimatedLines > 2 || // Lower threshold: use textarea if more than 2 lines
		value.length > 100 || // Use textarea for any text longer than 100 chars
		(totalHeight && totalHeight > rect.height); // OPTION B: Multi-line if content exceeds cell height

	useEffect(() => {
		if (isEditing) {
			const element = needsMultiLine
				? textareaRef.current
				: inputRef.current;
			if (element) {
				element.focus();
				// FIX ISSUE 1: Don't select text - just focus and place cursor at end
				if (needsMultiLine) {
					// For textarea: place cursor at end
					element.setSelectionRange(
						element.value.length,
						element.value.length,
					);
				} else {
					// For input: place cursor at end (don't select)
					(element as HTMLInputElement).setSelectionRange(
						element.value.length,
						element.value.length,
					);
				}
			}
		}
	}, [isEditing, needsMultiLine]);

	// FIX: Add native wheel event listener to prevent canvas scroll
	// This must be a native listener to catch events before InfiniteScroller's listener
	useEffect(() => {
		if (!containerRef.current || !isEditing) return;

		const container = containerRef.current;

		const nativeWheelHandler = (e: WheelEvent) => {
			// Always stop propagation when mouse is inside editor container
			e.stopPropagation();

			const textarea = needsMultiLine ? textareaRef.current : null;

			if (!textarea || !needsMultiLine) {
				// Not multi-line: prevent default, don't scroll
				e.preventDefault();
				return;
			}

			const { scrollTop, scrollHeight, clientHeight } = textarea;
			const isScrollable = scrollHeight > clientHeight;

			if (!isScrollable) {
				// Not scrollable: prevent default, don't scroll
				e.preventDefault();
				return;
			}

			const maxScrollTop = scrollHeight - clientHeight;
			const tolerance = 1;
			const isAtTop = scrollTop <= tolerance;
			const isAtBottom = scrollTop >= maxScrollTop - tolerance;

			// If textarea can scroll, scroll it
			if ((e.deltaY > 0 && !isAtBottom) || (e.deltaY < 0 && !isAtTop)) {
				e.preventDefault();
				const scrollAmount = e.deltaY;
				const newScrollTop = Math.max(
					0,
					Math.min(maxScrollTop, scrollTop + scrollAmount),
				);
				textarea.scrollTop = newScrollTop;
			} else {
				// At edge: prevent default but don't scroll
				e.preventDefault();
			}
		};

		// Use capture phase to catch events before InfiniteScroller
		container.addEventListener("wheel", nativeWheelHandler, {
			capture: true,
			passive: false,
		});

		return () => {
			container.removeEventListener("wheel", nativeWheelHandler, {
				capture: true,
			});
		};
	}, [isEditing, needsMultiLine]);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		setValue(e.target.value);
		// Don't call onChange on every keystroke - it causes full page re-renders
		// onChange will be called on save instead
	};

	const handleKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		// FIX ISSUE 1: Use keyCode like Teable for proper Enter handling
		const keyCode = (e.nativeEvent as any).keyCode;
		const shiftKey = e.shiftKey;

		if (needsMultiLine) {
			// For textarea: Enter (without Shift) saves and moves to next cell, Shift+Enter creates new line
			if (keyCode === 13 && !shiftKey) {
				// Enter without Shift: Save, close editor, then trigger navigation
				e.preventDefault();
				e.stopPropagation(); // Prevent keyboard hook from handling
				onChange(value); // Save value
				onSave?.(); // Close editor (FIX ISSUE 3: This sets editingCell to null)
				// FIX ISSUE 3: Ensure editor is closed before navigation
				requestAnimationFrame(() => {
					onEnterKey?.(false); // Trigger navigation to next cell
				});
			} else if (keyCode === 13 && shiftKey) {
				// Shift+Enter: Allow default behavior (creates new line)
				e.stopPropagation();
			} else if (keyCode === 27) {
				e.preventDefault();
				e.stopPropagation();
				onCancel?.();
			}
		} else {
			// For input: Enter saves and moves to next cell
			if (keyCode === 13) {
				e.preventDefault();
				e.stopPropagation(); // Prevent keyboard hook from handling
				onChange(value); // Save value
				onSave?.(); // Close editor (FIX ISSUE 3: This sets editingCell to null)
				// FIX ISSUE 3: Ensure editor is closed before navigation
				requestAnimationFrame(() => {
					onEnterKey?.(false); // Trigger navigation to next cell
				});
			} else if (keyCode === 27) {
				// Escape cancels editing
				e.preventDefault();
				e.stopPropagation();
				onCancel?.();
			}
		}
	};

	const handleBlur = () => {
		// FIX ISSUE 4: Use setTimeout to check if focus is still within editor after event propagation
		// This prevents blur when clicking inside editor or scrolling
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement))
			) {
				// Focus is still within editor, don't blur
				return;
			}

			// Focus moved outside, save and close
			onChange(value);
			onSave?.();
		}, 0);
	};

	// FIX ISSUE 4: Prevent blur during scroll and click (like Teable)
	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent event bubbling to grid (like Teable)
		// Don't preventDefault - allow normal text selection
	};

	// FIX ISSUE 2: React wheel handler (backup - native listener in useEffect handles primary logic)
	// This is kept for React synthetic events, but native listener in useEffect is primary
	const handleWheel = (e: React.WheelEvent) => {
		// Always stop propagation to prevent canvas scroll
		e.stopPropagation();
		e.preventDefault();
		// Native listener handles the actual scrolling logic
	};

	// OPTION B: Proper border alignment with dimensions
	// width + 4 (2px border on each side), marginLeft/Top -2 (to align border with cell)
	// FIX: Align text with renderer - renderer draws at y + cellVerticalPaddingMD
	// Since marginTop: -2 shifts input up, we need to compensate to align text properly
	// Base style for input/textarea - no border, positioned inside wrapper
	const inputBaseStyle: React.CSSProperties = {
		width: "100%",
		textAlign: "left",
		boxSizing: "border-box",
		paddingTop: `${cellVerticalPaddingSM}px`,
		paddingBottom: `0px`, // No bottom padding to push text to top
		paddingLeft: `${cellHorizontalPadding}px`,
		paddingRight: `${cellHorizontalPadding}px`,
		border: "none",
		backgroundColor: "transparent",
		fontSize: theme.fontSize,
		fontFamily: theme.fontFamily,
		outline: "none",
		resize: "none" as const,
	};

	// Wrapper style with border - matches cell dimensions
	const wrapperStyle: React.CSSProperties = {
		width: `${rect.width + 4}px`,
		height: `${rect.height + 4}px`,
		marginLeft: -2,
		marginTop: -2,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		backgroundColor: theme.cellBackgroundColor,
		borderRadius: 2,
		boxSizing: "border-box",
		overflow: "hidden",
		display: "flex",
		flexDirection: "column",
		alignItems: "flex-start",
	};

	if (needsMultiLine) {
		// FIX: Match Teable's approach - use 'auto' height with min/max constraints
		// This allows textarea to expand naturally based on content, like AutoSizeTextarea
		// Calculate minHeight based on cell height (like Teable's minHeight: height + 4)
		const minHeight = rect.height + 4; // Minimum height is cell height + border

		// Calculate maxHeight to prevent overflow beyond viewport
		// Use totalHeight if available (from measure), otherwise estimate from content
		let maxHeight: number | undefined = undefined;
		if (totalHeight && totalHeight > rect.height) {
			// Use measured totalHeight, but add some padding for the "Shift + Enter" hint area
			maxHeight = totalHeight + 4 + 20; // Add 20px for hint area (like Teable's paddingBottom: 16)
		} else if (value.length > 0) {
			// Estimate height from content if totalHeight not available
			const availableWidth = rect.width - cellHorizontalPadding * 2;
			const avgCharWidth = 7;
			const charsPerLine =
				Math.floor(availableWidth / avgCharWidth) || 50;
			const estimatedLines = Math.ceil(value.length / charsPerLine);
			const lineHeight = cellTextLineHeight;
			const estimatedHeight =
				estimatedLines * lineHeight + cellVerticalPaddingMD * 2;
			maxHeight = Math.max(estimatedHeight + 4, minHeight) + 20; // Add padding for hint
		}

		// Match Teable's style: height: 'auto' for multiline, with minHeight constraint
		inputBaseStyle.height = "auto" as const; // CRITICAL: Auto height allows textarea to expand
		inputBaseStyle.minHeight = `${minHeight}px`; // Minimum height constraint
		if (maxHeight) {
			inputBaseStyle.maxHeight = `${maxHeight}px`; // Maximum height to prevent overflow
		}
		inputBaseStyle.overflowY = "auto" as const; // Show scrollbar if content exceeds maxHeight
		inputBaseStyle.overflowX = "hidden" as const;
		// Add paddingBottom for hint area (like Teable's paddingBottom: 16)
		inputBaseStyle.paddingBottom = "16px";
		wrapperStyle.height = "auto" as const;
		wrapperStyle.minHeight = `${rect.height + 4}px`;
	} else {
		// For single-line input, let the input auto-size so the text sits at the top
		inputBaseStyle.lineHeight = `${theme.fontSize}px`;
		inputBaseStyle.height = "auto";
		inputBaseStyle.minHeight = undefined;
		inputBaseStyle.maxHeight = undefined;
		inputBaseStyle.overflowY = "hidden";
		inputBaseStyle.paddingBottom = "0px";
	}

	// FIX: Container height calculation - match Teable's approach
	// For multiline: container should allow textarea to expand (use minHeight, not fixed height)
	// For single-line: use fixed height
	const containerStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`, // OPTION B: Fixed viewport position
		// FIX: Align editor with renderer - renderer draws text at y + cellVerticalPaddingMD
		// Container needs to account for border offset (marginTop: -2) to align text properly
		top: `${rect.y}px`, // OPTION B: Fixed viewport position
		width: `${rect.width}px`, // OPTION B: Fixed width
		zIndex: 1000,
		pointerEvents: "auto", // Allow interaction with editor
	};

	if (needsMultiLine) {
		// CRITICAL FIX: Container should not constrain textarea height
		// Use minHeight instead of fixed height to allow textarea to expand
		containerStyle.minHeight = `${rect.height + 4}px`; // Minimum height
		containerStyle.height = "auto"; // Allow container to grow with textarea
	} else {
		// Single-line: use fixed height
		containerStyle.height = `${rect.height + 4}px`;
	}

	return (
		<div
			ref={containerRef}
			data-editor-container
			style={containerStyle}
			onMouseDown={handleMouseDown}
			onWheel={handleWheel}
		>
			<div style={wrapperStyle}>
				{needsMultiLine ? (
					<textarea
						ref={(el) => {
							textareaRef.current = el;
						}}
						value={value}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						onMouseDown={handleMouseDown} // FIX ISSUE 4: Prevent blur on scroll/click
						onWheel={handleWheel} // FIX ISSUE 2: Handle wheel events on textarea
						style={inputBaseStyle}
					/>
				) : (
					<input
						ref={(el) => {
							inputRef.current = el;
						}}
						type="text"
						value={value}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onBlur={handleBlur}
						onMouseDown={handleMouseDown} // FIX ISSUE 4: Prevent blur on click
						style={inputBaseStyle}
					/>
				)}
			</div>
		</div>
	);
};
