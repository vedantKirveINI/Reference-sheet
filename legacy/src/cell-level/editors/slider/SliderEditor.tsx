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
import styles from "./SliderEditor.module.css";

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

        /**
         * PATTERN: Local state management hook
         * - Updates local state immediately for UI feedback
         * - Does NOT call onChange (that's handled on save events)
         * - Matches StringEditor pattern exactly
         */
        const { sliderValue, handleSliderChange, handleSave } = useSliderEditor({
                initialValue,
                onChange: (value) => {
                        onChange(value);
                },
                minValue,
                maxValue,
        });

        /**
         * PATTERN: Keyboard event handler (matches StringEditor pattern)
         * - Enter: Save value and navigate to next cell
         * - Tab: Save value and navigate
         * - Escape: Cancel editing (discard changes)
         *
         * NOTE: onChange is called here (on save), NOT on every slider change
         * This matches StringEditor's pattern of calling onChange only on save events
         */
        const handleKeyDown = useCallback(
                (e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                // PATTERN: Save value before closing (matches StringEditor)
                                handleSave();
                                onSave?.();
                                // Trigger navigation if onEnterKey is provided
                                if (onEnterKey) {
                                        requestAnimationFrame(() => {
                                                onEnterKey(e.shiftKey);
                                        });
                                }
                        } else if (e.key === "Tab") {
                                e.preventDefault();
                                e.stopPropagation();
                                // PATTERN: Save value before closing (matches StringEditor)
                                handleSave();
                                onSave?.();
                                // Tab navigation would be handled by keyboard hook
                        } else if (e.key === "Escape") {
                                e.preventDefault();
                                e.stopPropagation();
                                onCancel?.();
                        }
                },
                [handleSave, onSave, onCancel, onEnterKey],
        );

        /**
         * PATTERN: Blur event handler (matches StringEditor pattern)
         * - Checks if focus is moving within editor (don't close if it is)
         * - Saves value when focus moves outside editor
         * - Uses setTimeout to check focus after event propagation (like StringEditor)
         */
        const handleBlur = useCallback(() => {
                // PATTERN: Use setTimeout to check focus after event propagation
                // This prevents blur when clicking inside editor or scrolling (matches StringEditor)
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

                        // Focus moved outside, save and close (matches StringEditor pattern)
                        handleSave();
                        onSave?.();
                }, 0);
        }, [handleSave, onSave]);

        /**
         * PATTERN: Prevent blur during mouse interactions (matches StringEditor)
         * Stops event propagation to prevent canvas from handling the event
         */
        const handleMouseDown = useCallback((e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent event bubbling to grid (like StringEditor)
                // Don't preventDefault - allow normal interactions within editor
        }, []);

        /**
         * PATTERN: Editor positioning and styling (matches StringEditor exactly)
         * - width + 4: Adds 4px for 2px border on each side
         * - height + 4: Adds 4px for 2px border on top/bottom
         * - marginLeft/Top -2: Offsets by border width to align border with cell
         * This ensures perfect alignment with the cell renderer
         */
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
                        className={styles.slider_container}
                        style={editorStyle}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        onMouseDown={handleMouseDown}
                        tabIndex={-1}
                        data-testid="slider-editor"
                >
                        <div className={styles.slider_input_container}>
                                <div className={styles.slider_wrapper}>
                                        <Slider
                                                value={[sliderValue]}
                                                onValueChange={(values) => handleSliderChange(null, values[0])}
                                                min={minValue}
                                                max={maxValue}
                                                step={1}
                                                className="flex-1 mr-2 mt-0.5 self-start"
                                        />
                                        <div
                                                className={styles.slider_value_display}
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
