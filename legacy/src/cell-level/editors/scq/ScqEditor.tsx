/**
 * SCQ Cell Editor Component
 * UI inspired by sheets project's SCQ editor
 * Functionality follows our MCQ editor pattern (save on Enter/Tab/blur)
 */
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from "react";
import type { ISCQCell } from "@/types";
import { getScqColor } from "@/cell-level/renderers/scq/utils/colorUtils";
import { useScqEditor } from "./hooks/useScqEditor";
import { useChipWidth } from "./hooks/useChipWidth";
import { Chip } from "./components/Chip";
import { OptionList } from "./components/OptionList";

interface ScqEditorProps {
	cell: ISCQCell;
	column?: { options?: string[]; rawOptions?: { options?: string[] } };
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: string | null) => void;
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

export const ScqEditor: React.FC<ScqEditorProps> = ({
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
	const options =
		column?.options ??
		column?.rawOptions?.options ??
		cell?.options?.options ??
		[];
	const initialValue = useMemo(() => {
		if (cell?.data) return cell.data;
		if (cell?.displayData) return cell.displayData;
		return null;
	}, [cell]);

	const {
		selectedOption,
		handleSelectOption,
		popperOpen,
		setPopperOpen,
		availableWidth,
		wrapClass,
		hasUserEdited,
	} = useScqEditor({
		initialValue,
		options,
		containerWidth: rect.width,
		containerHeight: rect.height,
	});

	const { borderRadius } = useChipWidth({
		value: selectedOption,
		availableWidth,
		wrapClass,
	});

	useEffect(() => {
		if (isEditing) {
			setPopperOpen(true);
			containerRef.current?.focus();
		}
	}, [isEditing, setPopperOpen]);

	const commitValue = useCallback(() => {
		if (hasUserEdited) {
			onChange(selectedOption ?? null);
		}
		onSave?.();
	}, [onChange, onSave, selectedOption, hasUserEdited]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" && !event.shiftKey) {
				if (popperOpen) {
					return;
				}
				event.preventDefault();
				event.stopPropagation();
				commitValue();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(event.shiftKey);
					});
				}
			} else if (event.key === "Tab") {
				event.preventDefault();
				event.stopPropagation();
				commitValue();
			} else if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				setPopperOpen(false);
				onCancel?.();
			}
		},
		[commitValue, onCancel, onEnterKey, popperOpen, setPopperOpen],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			const optionList = containerRef.current?.querySelector(
				"[data-scq-option-list]",
			);

			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement) ||
					optionList?.contains(activeElement))
			) {
				return;
			}
			commitValue();
		}, 0);
	}, [commitValue]);

	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
	}, []);

	const chipColor = selectedOption
		? getScqColor(selectedOption, options)
		: "#ECEFF1";

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
		padding: "4px 8px",
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
			data-testid="scq-editor"
		>
			<div className="flex items-start w-full min-h-0 overflow-hidden box-border">
				<Chip
					label={selectedOption}
					backgroundColor={chipColor}
					borderRadius={borderRadius}
					onTogglePopper={() => setPopperOpen((prev) => !prev)}
				/>
			</div>

			{popperOpen && (
				<div
					className="absolute top-[calc(100%+4px)] left-0 z-[1001]"
					style={{
						width: `${rect.width}px`,
					}}
				>
					<OptionList
						options={options}
						selectedOption={selectedOption}
						onSelectOption={(option) => {
							handleSelectOption(option);
							setPopperOpen(false);
							containerRef.current?.focus();
						}}
					/>
				</div>
			)}
		</div>
	);
};
