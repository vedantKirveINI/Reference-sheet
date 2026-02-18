import { isEmpty } from "lodash";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import ODSIcon from "@/lib/oute-icon";
import React, { useState, useRef, useEffect } from "react";

function MultiSelect({
	value = [],
	options = [],
	onChange = () => {},
	applyBorder = false,
	disablePortal = false,
	popperMaxHeight = "18.75",
	autoFocusSearch = false,
	maxWidth = "",
}) {
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [searchText, setSearchText] = useState("");
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

	const filteredOptions = options.filter((opt) =>
		(typeof opt === "string" ? opt : "").toLowerCase().includes(searchText.toLowerCase()),
	);

	const toggleOption = (option) => {
		const isSelected = value.includes(option);
		if (isSelected) {
			onChange(value.filter((v) => v !== option));
		} else {
			onChange([...value, option]);
		}
	};

	const removeTag = (option, e) => {
		e.stopPropagation();
		onChange(value.filter((v) => v !== option));
	};

	return (
		<div
			ref={containerRef}
			className="relative w-full"
			style={maxWidth ? { maxWidth: `${maxWidth}rem` } : undefined}
		>
			<div
				className={`flex flex-wrap gap-1 items-center w-full min-h-[36px] px-2 py-1 rounded-md bg-white cursor-pointer ${applyBorder ? "border border-[#d1d5db]" : ""}`}
				onClick={() => setDropdownOpen(!dropdownOpen)}
			>
				{isEmpty(value) ? (
					<span className="text-sm text-[#9ca3af]">Select Option</span>
				) : (
					<div className="flex flex-wrap gap-1">
						{value.map((option) => (
							<Badge
								key={option}
								variant="secondary"
								className="flex items-center gap-1 text-xs px-2 py-0.5 bg-[#DDC1FF] text-[var(--cell-text-primary-color)] font-[var(--tt-font-family)] tracking-[0.015rem]"
							>
								{option}
								<button
									onClick={(e) => removeTag(option, e)}
									className="ml-0.5 p-0 bg-transparent border-none cursor-pointer flex items-center"
								>
									<ODSIcon
										outeIconName="OUTECloseIcon"
										outeIconProps={{
											className: "w-3 h-3 text-[var(--cell-text-primary-color)]",
										}}
									/>
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>

			{dropdownOpen && (
				<div
					className="absolute z-50 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg overflow-hidden"
					style={{ maxHeight: `${popperMaxHeight}rem` }}
				>
					<div className="p-1.5">
						<Input
							placeholder="Search..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="mb-1"
							autoFocus={autoFocusSearch}
						/>
					</div>
					<div
						className="flex flex-col gap-1 p-1.5 overflow-y-auto"
						style={{ maxHeight: `${parseFloat(popperMaxHeight) - 3}rem` }}
						data-testid="ods-autocomplete-listbox"
					>
						{filteredOptions.map((option) => {
							const isSelected = value.includes(option);
							return (
								<div
									key={option}
									className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[#f5f5f5] ${isSelected ? "bg-[#1f2937] text-white hover:bg-[#1f2937]" : ""}`}
									onClick={() => toggleOption(option)}
								>
									<Checkbox
										checked={isSelected}
										onCheckedChange={() => toggleOption(option)}
										className={isSelected ? "border-white data-[state=checked]:bg-white data-[state=checked]:text-[#1f2937]" : ""}
									/>
									<span className="text-sm">{typeof option === "string" ? option : ""}</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}

export default MultiSelect;
