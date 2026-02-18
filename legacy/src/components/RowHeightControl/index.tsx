import React, { useMemo, useState, useRef, useEffect } from "react";
import { RowHeightLevel } from "@/types";
import { RowHeightIcon } from "./RowHeightIcon";

interface IRowHeightOption {
	level: RowHeightLevel;
	label: string;
}

interface RowHeightControlProps {
	value: RowHeightLevel;
	onChange?: (level: RowHeightLevel) => void;
}

const ROW_HEIGHT_OPTIONS: IRowHeightOption[] = [
	{
		level: RowHeightLevel.Short,
		label: "Short",
	},
	{
		level: RowHeightLevel.Medium,
		label: "Medium",
	},
	{
		level: RowHeightLevel.Tall,
		label: "Tall",
	},
	{
		level: RowHeightLevel.ExtraTall,
		label: "Extra Tall",
	},
];

export const RowHeightControl: React.FC<RowHeightControlProps> = ({
	value,
	onChange,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);

	const currentOption = useMemo(() => {
		return ROW_HEIGHT_OPTIONS.find((option) => option.level === value);
	}, [value]);

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	const handleSelect = (level: RowHeightLevel) => {
		onChange?.(level);
		handleClose();
	};

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<div className="relative inline-flex items-center">
			<button
				type="button"
				onClick={handleOpen}
				ref={buttonRef}
				className="flex items-center gap-1.5 py-1 px-2 bg-transparent border-none cursor-pointer rounded hover:bg-[#eceff1] transition-colors"
				data-testid="row-height-control-trigger"
				aria-label={`Row height: ${currentOption?.label ?? "Short"}`}
			>
				<RowHeightIcon
					level={value}
					isSelected={true}
					size={16}
				/>
				<span className="text-sm text-[#263238] whitespace-nowrap">Row size</span>
			</button>
			
			{isOpen && (
				<div
					ref={popoverRef}
					className="fixed z-[200] mt-3 bg-white border border-[#e5e7eb] rounded-lg shadow-[0px_4px_6px_rgba(0,0,0,0.1)] min-w-[10rem] py-2"
					style={{
						top: buttonRef.current
							? buttonRef.current.getBoundingClientRect().bottom
							: 0,
						left: buttonRef.current
							? buttonRef.current.getBoundingClientRect().left
							: 0,
					}}
				>
					<div>
						<div className="py-2 px-4">
							<span className="text-sm font-[Inter] text-[#424242]">
								Select a row height
							</span>
						</div>
						<div>
							{ROW_HEIGHT_OPTIONS.map((option) => {
								const isActive = option.level === value;
								return (
									<button
										type="button"
										key={option.level}
										onClick={() => handleSelect(option.level)}
										className={`flex items-center gap-2 w-full py-2 px-4 border-none bg-transparent cursor-pointer text-left hover:bg-[#f5f5f5] transition-colors ${isActive ? "bg-[#f0f0f0]" : ""}`}
										data-testid={`row-height-option-${option.level}`}
									>
										<div className="flex items-center">
											<RowHeightIcon
												level={option.level}
												isSelected={isActive}
												size={16}
											/>
										</div>
										<span
											className={`text-[13px] font-normal font-[Inter] flex-1 ${isActive ? "text-[#607D8B]" : "text-[#212121]"}`}
										>
											{option.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RowHeightControl;
