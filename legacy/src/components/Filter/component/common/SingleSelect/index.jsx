import isEmpty from "lodash/isEmpty";
import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

function SingleSelect({
	value = "",
	handleChange = () => {},
	options = [],
	popperMaxHeight = "18.75",
	defaultValue = "",
	applyBorder = false,
	disablePortal = false,
	optionBackgroundColor = {},
	chipFontSize = "var(--cell-font-size)",
	autoFocus = false,
}) {
	const correctValue = value || defaultValue;
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const containerRef = useRef(null);

	useEffect(() => {
		if (!dropdownOpen) return;
		const handleClickOutside = (e) => {
			if (containerRef.current && !containerRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [dropdownOpen]);

	const getLabel = (val) => {
		if (typeof options[0] === "object") {
			const opt = options.find((o) => o.value === val);
			return opt ? opt.label : val;
		}
		return val;
	};

	const getOptionValue = (option) => {
		return typeof option === "object" ? option.value : option;
	};

	const getOptionLabel = (option) => {
		return typeof option === "object" ? option.label : option;
	};

	const chipBg = correctValue
		? isEmpty(optionBackgroundColor)
			? "#DDC1FF"
			: optionBackgroundColor[correctValue] || "#DDC1FF"
		: undefined;

	return (
		<div ref={containerRef} className="relative w-full" data-testid="single-select-autocomplete">
			<div
				className={`flex items-center w-full min-h-[36px] px-2 py-1 rounded-md bg-white cursor-pointer ${applyBorder ? "border border-[#d1d5db]" : ""}`}
				onClick={() => setDropdownOpen(!dropdownOpen)}
			>
				{correctValue ? (
					<Badge
						variant="secondary"
						className="max-w-[80%] truncate"
						style={{
							background: chipBg,
							fontSize: chipFontSize,
							fontFamily: "var(--tt-font-family)",
							letterSpacing: "0.015rem",
							color: "var(--cell-text-primary-color)",
							...(applyBorder && { marginTop: "2px" }),
						}}
					>
						{getLabel(correctValue)}
					</Badge>
				) : (
					<span className="text-sm text-[#9ca3af]">Select...</span>
				)}
			</div>

			{dropdownOpen && (
				<div
					className="absolute z-50 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg overflow-hidden"
					style={{ maxHeight: `${popperMaxHeight}rem` }}
				>
					<div
						className="flex flex-col gap-1 p-1.5 overflow-y-auto"
						style={{ maxHeight: `${popperMaxHeight}rem` }}
						data-testid="ods-autocomplete-listbox"
					>
						{options.map((option) => {
							const optValue = getOptionValue(option);
							const optLabel = getOptionLabel(option);
							const isSelected = optValue === correctValue;

							return (
								<div
									key={optValue}
									className={`flex items-center gap-2 px-3 py-2 rounded cursor-pointer hover:bg-[#f5f5f5] ${isSelected ? "bg-[#1f2937] text-white hover:bg-[#1f2937]" : ""}`}
									onClick={() => {
										handleChange(optValue);
										setDropdownOpen(false);
									}}
								>
									<div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-white" : "border-gray-300"}`}>
										{isSelected && <div className={`w-2 h-2 rounded-full ${isSelected ? "bg-white" : "bg-[#212121]"}`} />}
									</div>
									<span className="text-sm">{optLabel}</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default SingleSelect;
