import React, { useState, useCallback, useRef, useEffect, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IMCQCell } from "@/types";
import { Chips } from "@/cell-level/editors/mcq/components/Chips";
import { OptionList } from "@/cell-level/editors/mcq/components/OptionList";
import { useMcqEditor } from "@/cell-level/editors/mcq/hooks/useMcqEditor";
import ODSPopper from "oute-ds-popper";
import ODSIcon from "oute-ds-icon";
import styles from "./McqFieldEditor.module.scss";

export const McqFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputContainerRef = useRef<HTMLDivElement>(null);
	const [popperOpen, setPopperOpen] = useState(false);

	const mcqCell = cell as IMCQCell | undefined;
	const options =
		field.options ??
		(field as { rawOptions?: { options?: string[] } }).rawOptions?.options ??
		mcqCell?.options?.options ??
		[];
	const initialValue = Array.isArray(value) ? value : [];

	// Use the same hook as grid editor for consistency
	const { currentOptions, handleSelectOption } = useMcqEditor({
		initialValue,
		options,
		containerWidth: 400, // Reasonable default for form context
		containerHeight: 36,
	});

	// Sync with value prop changes (when record changes externally)
	useEffect(() => {
		const newValue = Array.isArray(value) ? value : [];
		if (JSON.stringify(newValue) !== JSON.stringify(currentOptions)) {
			handleSelectOption(newValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// Handle toggling dropdown (open/close on click)
	const handleToggleDropdown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (readonly) return;
			e.stopPropagation();
			setPopperOpen((prev) => !prev);
		},
		[readonly],
	);

	// Handle closing dropdown
	const handleCloseDropdown = useCallback(() => {
		setPopperOpen(false);
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		if (!popperOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				!target.closest("[data-mcq-option-list]")
			) {
				handleCloseDropdown();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popperOpen, handleCloseDropdown]);

	// Update parent when selection changes (immediate feedback, but parent tracks changes)
	const handleSelectionChange = useCallback(
		(newOptions: string[]) => {
			handleSelectOption(newOptions);
			onChange(newOptions);
		},
		[handleSelectOption, onChange],
	);

	const iconName = popperOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	return (
		<div ref={containerRef} className={styles.mcq_editor}>
			<div
				ref={inputContainerRef}
				className={styles.mcq_input_container}
				onClick={handleToggleDropdown}
				data-testid="mcq-editor-form"
			>
				<div className={styles.chips_wrapper}>
					<Chips
						options={currentOptions}
						visibleChips={currentOptions} // Show all chips in expanded record view
						limitValue="" // No limit value in expanded record view
						limitValueChipWidth={0} // No limit value chip width
						handleSelectOption={handleSelectionChange}
						isWrapped={true} // Always wrap in expanded record view
					/>
				</div>

				{!readonly && (
					<div className={styles.expand_icon}>
						<ODSIcon
							outeIconName={iconName}
							outeIconProps={{
								sx: {
									width: "1.5rem",
									height: "1.5rem",
								},
							}}
						/>
					</div>
				)}
			</div>

			<ODSPopper
				open={popperOpen}
				anchorEl={inputContainerRef.current}
				placement="bottom-start"
				disablePortal
				className={styles.popper_container}
			>
				<div>
					<OptionList
						options={options}
						initialSelectedOptions={currentOptions}
						handleSelectOption={handleSelectionChange}
					/>
				</div>
			</ODSPopper>
		</div>
	);
};
