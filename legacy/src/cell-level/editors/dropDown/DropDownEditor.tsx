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

interface DropDownEditorProps {
	cell: IDropDownCell;
	column?: { options?: string[]; rawOptions?: { options?: string[] } };
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void;
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

	const options =
		column?.options ??
		column?.rawOptions?.options ??
		cell?.options?.options ??
		[];
	const initialValue = cell?.data || null;

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

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (
				e.key === "Enter" &&
				!popper.optionsList &&
				!popper.expandedView
			) {
				e.preventDefault();
				e.stopPropagation();
				if (hasUserEdited) {
					onChange(currentOptions);
				}
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				if (hasUserEdited) {
					onChange(currentOptions);
				}
				onSave?.();
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

	const handleBlur = useCallback(() => {
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
				return;
			}

			if (hasUserEdited) {
				onChange(currentOptions);
			}
			onSave?.();
		}, 0);
	}, [onSave, onChange, currentOptions, hasUserEdited]);

	useEffect(() => {
		if (isEditing && containerRef.current) {
			setPopper({
				optionsList: true,
				expandedView: false,
			});
		}
	}, [isEditing, setPopper]);

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
			className="flex flex-col h-full box-border"
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-testid="dropdown-editor"
		>
			<div
				className="flex items-center gap-2 flex-1 min-h-0 overflow-hidden pr-1.5"
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
						className="flex items-center justify-center w-5 h-5 cursor-pointer bg-[#212121] text-white rounded-sm shrink-0 ml-auto transition-colors hover:bg-[#4d4d4d] [&_svg]:w-full [&_svg]:h-full"
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

			{(popper.optionsList || popper.expandedView) && (
				<div
					ref={popperRef}
					className="bg-white border border-[#e0e0e0] rounded shadow-md overflow-hidden"
					style={{
						position: "absolute",
						...popperPlacement,
						zIndex: 1001,
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
						<div className="flex flex-col min-w-[300px] max-h-[400px]">
							<div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] shrink-0">
								<span className="text-sm font-medium">DropDown Options</span>
								<button
									className="bg-transparent border-none text-2xl cursor-pointer text-[#607d8b] p-0 w-6 h-6 flex items-center justify-center leading-none hover:text-[#455a64]"
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
							<div className="px-4 py-3 flex-1 overflow-y-auto min-h-[100px]">
								{currentOptions.length === 0 ? (
									<div className="text-[#9e9e9e] text-sm text-center py-5">
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
								className="px-4 py-2 border-t border-[#e0e0e0] bg-transparent border-l-0 border-r-0 border-b-0 cursor-pointer text-sm text-[#212121] text-left transition-colors hover:bg-[#f5f5f5]"
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
