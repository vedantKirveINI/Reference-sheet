import React, { useState, useCallback, useRef, useEffect, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import { Chip } from "@/cell-level/editors/yesNo/components/Chip";
import { useYesNoEditor } from "@/cell-level/editors/yesNo/hooks/useYesNoEditor";
import YES_NO_OPTIONS from "@/constants/yesNoOptions";

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

	useEffect(() => {
		const newValue = typeof value === "string" ? value : null;
		if (newValue !== selectedOption) {
			setSelectedOption(newValue);
		}
	}, [value]);

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

	const handleOptionSelect = useCallback(
		(value: string) => {
			setSelectedOption(value);
			onChange(value);
			handleCloseDropdown();
		},
		[setSelectedOption, onChange, handleCloseDropdown],
	);

	return (
		<div ref={containerRef} className="w-full relative min-h-[36px]">
			<div
				ref={inputContainerRef}
				className="flex items-center w-full min-h-[36px] py-1 px-2 border border-[#e0e0e0] rounded-md bg-white cursor-pointer focus-within:border-[#1976d2] focus-within:border-2 focus-within:py-[3px] focus-within:px-[7px]"
				data-testid="yesno-editor-form"
			>
				<Chip
					value={selectedOption}
					onTogglePopper={() => setPopperOpen((prev) => !prev)}
				/>
			</div>

			{popperOpen && (
				<div className="absolute z-[1001] bg-white border border-[#e0e0e0] rounded-md shadow-[0_6px_18px_rgba(0,0,0,0.12)] min-w-[200px] max-w-[300px] p-1">
					<div data-yesno-option-list>
						<div
							className="flex flex-col gap-0.5"
							onClick={(e) => e.stopPropagation()}
						>
							{optionList.map((option) => {
								const isSelected = option === selectedOption;

								return (
									<div
										key={option}
										className="flex items-center gap-2 py-2 px-3 cursor-pointer rounded hover:opacity-80"
										onClick={() => handleOptionSelect(option)}
									>
										<div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[#212121]" : "border-gray-300"}`}>
											{isSelected && <div className="w-2 h-2 rounded-full bg-[#212121]" />}
										</div>
										<span className="text-[13px] font-normal text-[#212121]">{option}</span>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
