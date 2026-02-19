/**
 * DropDown Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as McqEditor
 * Use this as a reference when creating new cell editors.
 *
 * KEY PATTERNS:
 * 1. SAVING LOGIC: onChange is called ONLY on save events (Enter/Tab/blur), NOT on every change
 * 2. POSITIONING: Matches StringEditor's border alignment
 * 3. KEYBOARD HANDLING: Enter/Tab for save, Escape for cancel
 * 4. BLUR HANDLING: Save on blur, but check if focus is moving within editor
 * 5. EVENT PROPAGATION: Stop propagation to prevent canvas scrolling/interaction
 */
import React, {
	useEffect,
	useLayoutEffect,
	useRef,
	useCallback,
	useState,
} from "react";
import type { IDropDownCell } from "@/types";
import { Chips } from "./components/Chips";
import { OptionList } from "./components/OptionList";
import { useDropDownEditor } from "./hooks/useDropDownEditor";
import { useChipWidths } from "./hooks/useChipWidths";
import styles from "./DropDownEditor.module.css";

interface DropDownEditorProps {
	cell: IDropDownCell;
	column?: { options?: string[]; rawOptions?: { options?: string[] } };
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void; // Match GridView's onChange signature
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const DropDownEditor: React.FC<DropDownEditorProps> = ({
	cell,
	column,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const expandedViewRef = useRef<HTMLDivElement>(null);
	const popperRef = useRef<HTMLDivElement>(null);
	const [popperPlacement, setPopperPlacement] = useState<React.CSSProperties>(
		{
			left: 0,
			top: "100%",
			marginTop: "4px",
		},
	);

	// Option A: column (field state) is source for option list; cell is fallback
	const options =
		column?.options ??
		column?.rawOptions?.options ??
		cell?.options?.options ??
		[];
	const initialValue = cell?.data || null;

	/**
	 * PATTERN: Local state management hook
	 * - Updates local state immediately for UI feedback
	 * - Does NOT call onChange (that's handled on save events)
	 * - Matches McqEditor pattern exactly
	 */
	const {
		currentOptions,
		handleSelectOption,
		popper,
		setPopper,
		availableWidth,
		availableHeight,
		wrapClass,
		hasUserEdited,
	} = useDropDownEditor({
		initialValue,
		options,
		containerWidth: rect.width,
		containerHeight: rect.height,
	});

	const { visibleChips, limitValue, limitValueChipWidth } = useChipWidths({
		selectionValues: currentOptions,
		availableWidth,
		availableHeight,
		isWrapped: wrapClass === "wrap",
	});

	/**
	 * PATTERN: Keyboard event handler (matches McqEditor pattern)
	 * - Enter: Save value and navigate to next cell
	 * - Tab: Save value and navigate
	 * - Escape: Cancel editing (discard changes)
	 *
	 * NOTE: onChange is called here (on save), NOT on every selection
	 * This matches McqEditor's pattern of calling onChange only on save events
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Don't handle Enter if options list is open (let user select options)
			if (
				e.key === "Enter" &&
				!popper.optionsList &&
				!popper.expandedView
			) {
				e.preventDefault();
				e.stopPropagation();
				// PATTERN: Save value before closing (matches McqEditor)
				// Only save if user actually edited (preserves errored data if no changes)
				if (hasUserEdited) {
					onChange(currentOptions);
				}
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
				// PATTERN: Save value before closing (matches McqEditor)
				// Only save if user actually edited (preserves errored data if no changes)
				if (hasUserEdited) {
					onChange(currentOptions);
				}
				onSave?.();
				// Tab navigation would be handled by keyboard hook
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onCancel?.();
			}
		},
		[
			popper,
			onSave,
			onCancel,
			onEnterKey,
			onChange,
			currentOptions,
			hasUserEdited,
		],
	);

	/**
	 * PATTERN: Blur event handler (matches McqEditor pattern)
	 * - Checks if focus is moving within editor (don't close if it is)
	 * - Saves value when focus moves outside editor
	 * - Uses setTimeout to check focus after event propagation (like McqEditor)
	 */
	const handleBlur = useCallback(() => {
		// PATTERN: Use setTimeout to check focus after event propagation
		// This prevents blur when clicking inside editor or scrolling (matches McqEditor)
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					document
						.querySelector("[data-dropdown-option-list]")
						?.contains(activeElement))
			) {
				// Focus is still within editor, don't blur
				return;
			}

			// Focus moved outside, save and close (matches McqEditor pattern)
			// Only save if user actually edited (preserves errored data if no changes)
			if (hasUserEdited) {
				onChange(currentOptions);
			}
			onSave?.();
		}, 0);
	}, [onSave, onChange, currentOptions, hasUserEdited]);

	/**
	 * PATTERN: Auto-open options list when editor opens
	 * This provides immediate access to options when user starts editing
	 */
	useEffect(() => {
		if (isEditing && containerRef.current) {
			setPopper({
				optionsList: true,
				expandedView: false,
			});
		}
	}, [isEditing, setPopper]);

	/**
	 * Flip popper placement when it would go off-screen (right → left, bottom → top).
	 * Uses requestAnimationFrame so we measure after the popper has laid out (e.g. width: max-content).
	 */
	useLayoutEffect(() => {
		if (!(popper.optionsList || popper.expandedView)) {
			setPopperPlacement({ left: 0, top: "100%", marginTop: "4px" });
			return;
		}
		const raf = requestAnimationFrame(() => {
			const el = popperRef.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const vw = window.innerWidth;
			const vh = window.innerHeight;
			const placement: React.CSSProperties = {
				left: 0,
				top: "100%",
				marginTop: "4px",
			};
			if (rect.right > vw) {
				placement.left = "auto";
				placement.right = 0;
			}
			if (rect.bottom > vh) {
				placement.top = "auto";
				placement.bottom = "100%";
				placement.marginTop = "auto";
				placement.marginBottom = "4px";
			}
			setPopperPlacement(placement);
		});
		return () => cancelAnimationFrame(raf);
	}, [popper.optionsList, popper.expandedView]);

	/**
	 * PATTERN: Prevent blur during mouse interactions (matches McqEditor)
	 * Stops event propagation to prevent canvas from handling the event
	 */
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent event bubbling to grid (like McqEditor)
		// Don't preventDefault - allow normal interactions within editor
	}, []);

	/**
	 * PATTERN: Editor positioning and styling (matches McqEditor exactly)
	 * - width + 4: Adds 4px for 2px border on each side
	 * - height + 4: Adds 4px for 2px border on top/bottom
	 * - marginLeft/Top -2: Offsets by border width to align border with cell
	 * This ensures perfect alignment with the cell renderer
	 */
	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`, // Add 4px for 2px border on each side (like McqEditor)
		height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom (like McqEditor)
		marginLeft: -2, // Offset by border width to align with cell (like McqEditor)
		marginTop: -2, // Offset by border width to align with cell (like McqEditor)
		zIndex: 1000,
		backgroundColor: theme.cellBackgroundColor,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		borderRadius: "2px",
		padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
		boxSizing: "border-box",
		pointerEvents: "auto", // Allow interaction with editor (like McqEditor)
	};

	return (
		<div
			ref={containerRef}
			className={styles.dropdown_container}
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown} // PATTERN: Prevent blur on click (matches McqEditor)
			tabIndex={-1}
			data-testid="dropdown-editor"
		>
			<div
				className={styles.dropdown_input_container}
				data-testid="dropdown-editor"
			>
				<Chips
					options={currentOptions}
					visibleChips={visibleChips}
					limitValue={limitValue}
					limitValueChipWidth={limitValueChipWidth}
					handleSelectOption={handleSelectOption}
					isWrapped={wrapClass === "wrap"}
				/>

				{(currentOptions.length > 0 || popper?.expandedView) && (
					<div
						ref={expandedViewRef}
						className={styles.expand_icon}
						onClick={() => {
							setPopper((prev) => ({
								...prev,
								expandedView: !prev.expandedView,
								optionsList: !prev.optionsList,
							}));
						}}
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
						</svg>
					</div>
				)}
			</div>

			{/* Options List Popper */}
			{(popper.optionsList || popper.expandedView) && (
				<div
					ref={popperRef}
					className={styles.popper_container}
					style={{
						position: "absolute",
						...popperPlacement,
						zIndex: 1001,
						// Options list: match editor width. Expanded view: grow to fit content.
						...(popper.expandedView
							? {
									minWidth: `${Math.max(rect.width, 300)}px`,
									width: "max-content",
								}
							: { width: `${rect.width}px` }),
					}}
				>
					{popper.optionsList ? (
						<OptionList
							options={options}
							initialSelectedOptions={currentOptions}
							handleSelectOption={handleSelectOption}
						/>
					) : (
						<div className={styles.expanded_view_container}>
							<div className={styles.expanded_header}>
								<span>DropDown Options</span>
								<button
									className={styles.close_button}
									onClick={() => {
										setPopper({
											expandedView: false,
											optionsList: true,
										});
									}}
								>
									×
								</button>
							</div>
							<div className={styles.expanded_chips}>
								{currentOptions.length === 0 ? (
									<div className={styles.empty_option}>
										Please select an option
									</div>
								) : (
									<Chips
										options={currentOptions}
										visibleChips={currentOptions}
										limitValue=""
										limitValueChipWidth={0}
										handleSelectOption={handleSelectOption}
										isWrapped={true}
									/>
								)}
							</div>
							<button
								className={styles.select_option_button}
								onClick={() => {
									setPopper({
										expandedView: false,
										optionsList: true,
									});
								}}
							>
								SELECT AN OPTION
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};
