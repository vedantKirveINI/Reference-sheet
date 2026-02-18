import isEmpty from "lodash/isEmpty";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import React, { useState, useRef, useEffect } from "react";

import useDropdownHandler from "../hooks/useDropdownHandler";

const DropdownFilter = ({
	defaultValue = [],
	onChange = () => {},
	...rest
}) => {
	const {
		value = [],
		handleChange = () => {},
		options = [],
	} = useDropdownHandler({
		defaultValue,
		onChange,
		rest,
	});

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

	const optionLabels = options.map((item) => item?.label);
	const filteredOptions = optionLabels.filter((opt) =>
		opt.toLowerCase().includes(searchText.toLowerCase()),
	);

	const toggleOption = (option) => {
		const newValue = value.includes(option)
			? value.filter((v) => v !== option)
			: [...value, option];
		handleChange(newValue);
	};

	return (
		<div ref={containerRef} className="relative min-w-full w-full max-w-[32rem]">
			<div
				className="flex flex-wrap gap-1 items-center w-full min-h-[36px] px-2 py-1 border border-[#d1d5db] rounded-md bg-white cursor-pointer"
				onClick={() => setDropdownOpen(!dropdownOpen)}
			>
				{isEmpty(value) ? (
					<span className="text-sm text-[#9ca3af]">Select Option</span>
				) : (
					value.map((v) => (
						<span
							key={v}
							className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#f3f4f6] text-[#374151]"
						>
							{v}
						</span>
					))
				)}
			</div>

			{dropdownOpen && (
				<div className="absolute z-50 mt-1 w-full bg-white border border-[#e5e7eb] rounded-md shadow-lg max-h-[18.75rem] overflow-hidden">
					<div className="p-1.5">
						<Input
							placeholder="Search..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							className="mb-1"
							autoFocus
						/>
					</div>
					<div
						className="flex flex-col gap-1 p-1.5 max-h-[15rem] overflow-y-auto"
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
									<span className="text-sm">{option}</span>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
};

export default DropdownFilter;
