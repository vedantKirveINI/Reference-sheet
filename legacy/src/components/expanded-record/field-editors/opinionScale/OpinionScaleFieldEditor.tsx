import { useState, useCallback, useMemo, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IOpinionScaleCell } from "@/types";
import { validateOpinionScale } from "@/cell-level/renderers/opinion-scale/utils/validateOpinionScale";

export const OpinionScaleFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const opinionScaleCell = cell as IOpinionScaleCell | undefined;

	const fieldOptions = field.options as { maxValue?: number } | undefined;
	const maxValue =
		fieldOptions?.maxValue ?? opinionScaleCell?.options?.maxValue ?? 10;

	const options = useMemo(() => {
		return Array.from({ length: maxValue }, (_, i) => i + 1);
	}, [maxValue]);

	const { processedValue } = useMemo(() => {
		return validateOpinionScale({
			value: (value ?? opinionScaleCell?.data) as
				| number
				| string
				| null
				| undefined,
			maxValue,
		});
	}, [value, opinionScaleCell?.data, maxValue]);

	const selectedValue = processedValue ?? null;

	const [isOpen, setIsOpen] = useState(false);

	const handleChange = useCallback(
		(newValue: number | null) => {
			if (readonly) return;
			onChange(newValue);
			setIsOpen(false);
		},
		[onChange, readonly],
	);

	const handleOpen = useCallback(() => {
		if (!readonly) {
			setIsOpen(true);
		}
	}, [readonly]);

	const handleClose = useCallback(() => {
		setIsOpen(false);
	}, []);

	const displayValue =
		selectedValue !== null && selectedValue !== undefined
			? `${selectedValue}/${maxValue}`
			: "";

	return (
		<div data-testid="opinion-scale-expanded-row" className="relative">
			<div
				className="flex items-center w-full min-h-[36px] px-3 py-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer text-sm"
				onClick={handleOpen}
			>
				<span className={displayValue ? "text-[#212121]" : "text-[#9e9e9e]"}>
					{displayValue || "Select a value"}
				</span>
				<svg className="ml-auto h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
					<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
				</svg>
			</div>
			{isOpen && (
				<>
					<div className="fixed inset-0 z-40" onClick={handleClose} />
					<div className="absolute z-50 mt-1 w-full max-h-[18.75rem] overflow-y-auto bg-white border border-[#e0e0e0] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] p-1.5 flex flex-col gap-1.5">
						{options.map((opt) => (
							<div
								key={opt}
								className={`px-3 py-2 rounded cursor-pointer text-sm hover:bg-[#f5f5f5] ${selectedValue === opt ? "bg-[#e3f2fd] font-medium" : ""}`}
								onClick={() => handleChange(opt)}
								data-testid="ods-autocomplete-listbox"
							>
								{opt}
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
};
