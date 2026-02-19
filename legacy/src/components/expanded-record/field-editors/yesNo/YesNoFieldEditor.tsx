import React, { useState, useCallback, useRef, useEffect, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import { Chip } from "@/cell-level/editors/yesNo/components/Chip";
import { useYesNoEditor } from "@/cell-level/editors/yesNo/hooks/useYesNoEditor";
import YES_NO_OPTIONS from "@/constants/yesNoOptions";
import ODSPopper from "oute-ds-popper";
import ODSRadio from "oute-ds-radio";
import styles from "./YesNoFieldEditor.module.scss";

export const YesNoFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputContainerRef = useRef<HTMLDivElement>(null);
	const [popperOpen, setPopperOpen] = useState(false);

	const options = YES_NO_OPTIONS.map((opt) => opt.value);

	const initialValue = typeof value === "string" ? value : null;

	// Use the same hook as grid editor for consistency
	const {
		options: optionList,
		selectedOption,
		setSelectedOption,
	} = useYesNoEditor({
		initialValue,
		options,
		containerWidth: 400,
		containerHeight: 36,
	});

	// Sync with value prop changes (when record changes externally)
	useEffect(() => {
		const newValue = typeof value === "string" ? value : null;
		if (newValue !== selectedOption) {
			setSelectedOption(newValue);
		}
	}, [value]);

	// Handle opening dropdown
	// const handleOpenDropdown = useCallback(
	// 	(e: React.MouseEvent<HTMLDivElement>) => {
	// 		if (readonly) return;
	// 		e.stopPropagation();
	// 		setPopperOpen(true);
	// 	},
	// 	[readonly],
	// );

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
				!target.closest("[data-yesno-option-list]")
			) {
				handleCloseDropdown();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popperOpen, handleCloseDropdown]);

	// Handle option selection
	const handleOptionSelect = useCallback(
		(value: string) => {
			setSelectedOption(value);
			onChange(value);
			handleCloseDropdown();
		},
		[setSelectedOption, onChange, handleCloseDropdown],
	);

	return (
		<div ref={containerRef} className={styles.yesno_editor}>
			<div
				ref={inputContainerRef}
				className={styles.yesno_input_container}
				data-testid="yesno-editor-form"
			>
				<Chip
					value={selectedOption}
					onTogglePopper={() => setPopperOpen((prev) => !prev)}
				/>
			</div>

			<ODSPopper
				open={popperOpen}
				anchorEl={inputContainerRef.current}
				placement="bottom-start"
				disablePortal
				className={styles.popper_container}
			>
				<div data-yesno-option-list>
					<div
						className={styles.option_list}
						onClick={(e) => e.stopPropagation()}
					>
						{optionList.map((option) => {
							const isSelected = option === selectedOption;

							return (
								<div
									key={option}
									className={styles.option_row}
									onClick={() => handleOptionSelect(option)}
								>
									<ODSRadio
										labelText={option}
										labelProps={{
											variant: "subtitle1",
										}}
										formControlLabelProps={{
											value: option,
											sx: { width: "100%" },
										}}
										radioProps={{
											checked: isSelected,
											size: "small",
											onChange: () =>
												handleOptionSelect(option),
											sx: {
												"&.Mui-checked": {
													color: "#212121",
												},
											},
										}}
									/>
								</div>
							);
						})}
					</div>
				</div>
			</ODSPopper>
		</div>
	);
};
