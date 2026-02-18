/**
 * Slider Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as StringEditor and McqEditor
 * Use this as a reference when creating new cell editors.
 *
 * KEY PATTERNS:
 * 1. SAVING LOGIC: onChange is called ONLY on save events (Enter/Tab/blur), NOT on every change
 *    - Local state updates immediately for UI feedback
 *    - Parent onChange is called only when saving
 *    - This prevents full page re-renders during editing
 *
 * 2. POSITIONING: Matches StringEditor's border alignment
 *    - width: rect.width + 4 (2px border on each side)
 *    - height: rect.height + 4 (2px border on top/bottom)
 *    - marginLeft/Top: -2 (aligns border with cell)
 *
 * 3. KEYBOARD HANDLING:
 *    - Enter: Save and navigate to next cell
 *    - Tab: Save and navigate
 *    - Escape: Cancel editing
 *
 * 4. BLUR HANDLING: Save on blur (focus out), but check if focus is moving within editor
 *
 * 5. EVENT PROPAGATION: Stop propagation to prevent canvas scrolling/interaction
 */
import React, { useRef, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import type { ISliderCell } from "@/types";
import { useSliderEditor } from "./hooks/useSliderEditor";

interface SliderEditorProps {
	cell: ISliderCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: number | null) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const SliderEditor: React.FC<SliderEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);

	const initialValue = cell?.data ?? null;
	const minValue = cell?.options?.minValue ?? 0;
	const maxValue = cell?.options?.maxValue ?? 10;

	const { sliderValue, handleSliderChange, handleSave } = useSliderEditor({
		initialValue,
		onChange: (value) => {
			onChange(value);
		},
		minValue,
		maxValue,
	});

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				handleSave();
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onCancel?.();
			}
		},
		[handleSave, onSave, onCancel, onEnterKey],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement))
			) {
				return;
			}

			handleSave();
			onSave?.();
		}, 0);
	}, [handleSave, onSave]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`,
		height: `${rect.height + 4}px`,
		marginLeft: -2,
		marginTop: -2,
		zIndex: 1000,
		backgroundColor: theme.cellBackgroundColor,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		borderRadius: "2px",
		padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
		boxSizing: "border-box",
		pointerEvents: "auto",
	};

	return (
		<div
			ref={containerRef}
			className="box-border outline-none flex flex-col h-full"
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-testid="slider-editor"
		>
			<div className="flex items-start px-2.5 py-1 min-h-0 w-full flex-1">
				<div className="flex items-start w-full gap-1">
					<Slider
						value={[sliderValue]}
						onValueChange={(vals) => {
							handleSliderChange(null as any, vals[0]);
						}}
						min={minValue}
						max={maxValue}
						step={1}
						className="flex-1 mr-2 mt-0.5 self-start"
					/>
					<div
						className="shrink-0 whitespace-nowrap select-none font-normal leading-none"
						style={{
							color: theme.cellTextColor || "#212121",
							fontSize: theme.fontSize || 13,
							fontFamily: theme.fontFamily || "Inter",
						}}
					>
						{`${sliderValue}/${maxValue}`}
					</div>
				</div>
			</div>
		</div>
	);
};
