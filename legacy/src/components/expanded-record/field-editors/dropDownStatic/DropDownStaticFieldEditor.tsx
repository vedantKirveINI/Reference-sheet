import React, { useState, useCallback, useRef, useEffect, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IDropDownCell } from "@/types";
import { Chips } from "@/cell-level/editors/mcq/components/Chips";
import { OptionList } from "@/cell-level/editors/mcq/components/OptionList";
import { useMcqEditor } from "@/cell-level/editors/mcq/hooks/useMcqEditor";
import ODSPopper from "oute-ds-popper";
import ODSIcon from "oute-ds-icon";
import styles from "./DropDownStaticFieldEditor.module.scss";

export const DropDownStaticFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputContainerRef = useRef<HTMLDivElement>(null);
	const [popperOpen, setPopperOpen] = useState(false);

	const dropDownStaticCell = cell as IDropDownCell | undefined;

	// Extract options - prefer column (field) options so newly added options are visible
	const rawOptions =
		field.options ??
		(field as { rawOptions?: { options?: string[] } }).rawOptions?.options ??
		dropDownStaticCell?.options?.options ??
		[];

	const options = Array.isArray(rawOptions)
		? rawOptions.map((opt) => {
				if (typeof opt === "string") return opt;
				if (typeof opt === "object" && opt !== null && "label" in opt) {
					return opt.label;
				}
				return String(opt);
			})
		: [];

	// Normalize value to string[] (like MCQ)
	const normalizeValue = (val: unknown): string[] => {
		if (!val) return [];
		if (Array.isArray(val)) {
			return val.map((item) => {
				if (typeof item === "string") return item;
				if (
					typeof item === "object" &&
					item !== null &&
					"label" in item
				) {
					return item.label;
				}
				return String(item);
			});
		}
		return [];
	};

	const initialValue = normalizeValue(value);

	// Use the same hook as grid editor for consistency
	const { currentOptions, handleSelectOption } = useMcqEditor({
		initialValue,
		options,
		containerWidth: 400, // Reasonable default for form context
		containerHeight: 36,
	});

	// Sync with value prop changes (when record changes externally)
	useEffect(() => {
		const newValue = normalizeValue(value);
		if (JSON.stringify(newValue) !== JSON.stringify(currentOptions)) {
			handleSelectOption(newValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	// Handle toggling dropdown static (open/close on click)
	const handleToggleDropdown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (readonly) return;
			e.stopPropagation();
			setPopperOpen((prev) => !prev);
		},
		[readonly],
	);

	// Handle closing dropdown static
	const handleCloseDropdown = useCallback(() => {
		setPopperOpen(false);
	}, []);

	// Close dropdown static when clicking outside
	useEffect(() => {
		if (!popperOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				!target.closest("[data-dropdown-static-option-list]")
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
		<div ref={containerRef} className={styles.dropdown_static_editor}>
			<div
				ref={inputContainerRef}
				className={styles.dropdown_static_input_container}
				onClick={handleToggleDropdown}
				data-testid="dropdown-static-editor-form"
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
				<div data-dropdown-static-option-list>
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
