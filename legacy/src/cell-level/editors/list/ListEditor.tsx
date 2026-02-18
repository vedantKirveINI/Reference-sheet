import React, { useCallback, useEffect, useRef } from "react";
import type { IListCell } from "@/types";
import { Chips } from "../mcq/components/Chips";
import { useChipWidths } from "../mcq/hooks/useChipWidths";
import { useListEditor } from "./hooks/useListEditor";
import { OptionList } from "./components/OptionList";
import styles from "../mcq/McqEditor.module.css";

interface ListEditorProps {
	cell: IListCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void; // receives array of strings
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
		currentOptions, // selected options
		allOptions, // master list including added ones
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
			className={styles.mcq_container}
			style={{
				position: "absolute",
				left: `${rect.x}px`,
				top: `${rect.y}px`,
				width: `${rect.width + 4}px`, // Add 4px for 2px border on each side (like StringEditor)
				height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom (like StringEditor)
				marginLeft: -2, // Offset by border width to align with cell (like StringEditor)
				marginTop: -2, // Offset by border width to align with cell (like StringEditor)
				zIndex: 1000,
				backgroundColor: theme.cellBackgroundColor,
				border: `2px solid ${theme.cellActiveBorderColor}`,
				borderRadius: "2px",
				padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
				boxSizing: "border-box",
				pointerEvents: "auto", // Allow interaction with editor (like StringEditor)
			}}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={0}
		>
			<div className={styles.mcq_input_container}>
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
						className={styles.expand_icon}
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
					className={styles.popper_container}
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
					className={styles.popper_container}
					style={{ position: "absolute", top: rect.height, left: 0 }}
				>
					<div className={styles.expanded_view_container}>
						<div className={styles.expanded_header}>
							<span>Select options</span>
							<button
								className={styles.close_button}
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
						<div className={styles.expanded_chips}>
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

