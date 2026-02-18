import React, { useState, useCallback, useRef, useEffect, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IDropDownCell } from "@/types";
import { Chips } from "@/cell-level/editors/mcq/components/Chips";
import { OptionList } from "@/cell-level/editors/mcq/components/OptionList";
import { useMcqEditor } from "@/cell-level/editors/mcq/hooks/useMcqEditor";
import ODSIcon from "@/lib/oute-icon";

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

	const normalizeValue = (val: unknown): string[] => {
		if (!val) return [];
		if (Array.isArray(val)) {
			return val.map((item) => {
				if (typeof item === "string") return item;
				if (typeof item === "object" && item !== null && "label" in item) {
					return item.label;
				}
				return String(item);
			});
		}
		return [];
	};

	const initialValue = normalizeValue(value);

	const { currentOptions, handleSelectOption } = useMcqEditor({
		initialValue,
		options,
		containerWidth: 400,
		containerHeight: 36,
	});

	useEffect(() => {
		const newValue = normalizeValue(value);
		if (JSON.stringify(newValue) !== JSON.stringify(currentOptions)) {
			handleSelectOption(newValue);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);

	const handleToggleDropdown = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (readonly) return;
			e.stopPropagation();
			setPopperOpen((prev) => !prev);
		},
		[readonly],
	);

	const handleCloseDropdown = useCallback(() => {
		setPopperOpen(false);
	}, []);

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

	const handleSelectionChange = useCallback(
		(newOptions: string[]) => {
			handleSelectOption(newOptions);
			onChange(newOptions);
		},
		[handleSelectOption, onChange],
	);

	const iconName = popperOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	return (
		<div ref={containerRef} className="w-full relative min-h-[36px]">
			<div
				ref={inputContainerRef}
				className="flex items-start gap-1.5 w-full min-h-[36px] py-1 px-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus-within:border-[rgb(33,150,243)]"
				onClick={handleToggleDropdown}
				data-testid="dropdown-static-editor-form"
			>
				<div className="flex-1 min-w-0 max-h-[100px] overflow-y-auto overflow-x-hidden">
					<Chips
						options={currentOptions}
						visibleChips={currentOptions}
						limitValue=""
						limitValueChipWidth={0}
						handleSelectOption={handleSelectionChange}
						isWrapped={true}
					/>
				</div>

				{!readonly && (
					<div className="flex items-center justify-center flex-shrink-0 mt-0.5 relative z-[1]">
						<ODSIcon
							outeIconName={iconName}
							outeIconProps={{ size: 24, className: "w-6 h-6" }}
						/>
					</div>
				)}
			</div>

			{popperOpen && (
				<div className="absolute z-[100] bg-white border border-[#e0e0e0] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] overflow-hidden min-w-[18.75rem] max-w-[25rem] max-h-[18.75rem] w-full box-border">
					<div data-dropdown-static-option-list>
						<OptionList
							options={options}
							initialSelectedOptions={currentOptions}
							handleSelectOption={handleSelectionChange}
						/>
					</div>
				</div>
			)}
		</div>
	);
};
