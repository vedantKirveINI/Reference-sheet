import React, { useCallback, useEffect, useRef } from "react";
import type { IListCell } from "@/types";
import { Chips } from "../mcq/components/Chips";
import { useChipWidths } from "../mcq/hooks/useChipWidths";
import { useListEditor } from "./hooks/useListEditor";
import { OptionList } from "./components/OptionList";

interface ListEditorProps {
	cell: IListCell;
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

export const ListEditor: React.FC<ListEditorProps> = ({
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
	const expandedViewRef = useRef<HTMLDivElement>(null);

	const options = (cell as any)?.options || [];
	const initialValue = cell?.data ?? cell?.displayData ?? [];

	const {
		currentOptions,
		allOptions,
		handleSelectOption,
		handleAddNewOption,
		popper,
		setPopper,
		availableWidth,
		availableHeight,
		wrapClass,
		hasUserEdited,
	} = useListEditor({
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
					requestAnimationFrame(() => onEnterKey(e.shiftKey));
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
						.querySelector("[data-list-option-list]")
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

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	return (
		<div
			ref={containerRef}
			className="flex flex-col h-full box-border"
			style={{
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
			}}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={0}
		>
			<div className="flex items-center gap-2 flex-1 min-h-0 overflow-hidden pr-1.5">
				<Chips
					options={currentOptions}
					visibleChips={visibleChips}
					limitValue={limitValue}
					handleSelectOption={handleSelectOption}
					isWrapped={wrapClass === "wrap"}
					limitValueChipWidth={limitValueChipWidth}
				/>

				{(currentOptions.length > 0 || popper.expandedView) && (
					<div
						className="flex items-center justify-center w-5 h-5 cursor-pointer bg-[#212121] text-white rounded-sm shrink-0 ml-auto transition-colors hover:bg-[#4d4d4d] [&_svg]:w-full [&_svg]:h-full"
						onClick={() =>
							setPopper((prev) => ({
								...prev,
								optionsList: false,
								expandedView: !prev.expandedView,
							}))
						}
						ref={expandedViewRef}
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path d="M8 3H5a2 2 0 0 0-2 2v3" />
							<path d="M16 3h3a2 2 0 0 1 2 2v3" />
							<path d="M8 21H5a2 2 0 0 1-2-2v-3" />
							<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
						</svg>
					</div>
				)}
			</div>

			{popper.optionsList && (
				<div
					className="bg-white border border-[#e0e0e0] rounded shadow-md overflow-hidden"
					style={{ position: "absolute", top: rect.height, left: 0 }}
				>
					<OptionList
						options={allOptions}
						initialSelectedOptions={currentOptions}
						handleSelectOption={handleSelectOption}
						handleAddNewOption={handleAddNewOption}
					/>
				</div>
			)}

			{popper.expandedView && (
				<div
					className="bg-white border border-[#e0e0e0] rounded shadow-md overflow-hidden"
					style={{ position: "absolute", top: rect.height, left: 0 }}
				>
					<div className="flex flex-col min-w-[300px] max-h-[400px]">
						<div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] shrink-0">
							<span className="text-sm font-medium">Select options</span>
							<button
								className="bg-transparent border-none text-2xl cursor-pointer text-[#607d8b] p-0 w-6 h-6 flex items-center justify-center leading-none hover:text-[#455a64]"
								onClick={() =>
									setPopper((prev) => ({
										...prev,
										expandedView: false,
									}))
								}
								type="button"
							>
								×
							</button>
						</div>
						<div className="px-4 py-3 flex-1 overflow-y-auto min-h-[100px]">
							<OptionList
								options={allOptions}
								initialSelectedOptions={currentOptions}
								handleSelectOption={handleSelectOption}
								handleAddNewOption={handleAddNewOption}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
