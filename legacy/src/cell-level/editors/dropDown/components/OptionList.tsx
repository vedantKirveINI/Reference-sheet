/**
 * OptionList component with search functionality for DropDown editor
 * Adapted from MCQ's OptionList but handles both string and object options
 * Inspired by sheets project's DropdownDynamicOptionList
 */
import React, { useState, useEffect, useRef } from "react";
import type { DropDownOption } from "../utils/helper";
import {
	getDisplayValue,
	getItemKey,
	isOptionSelected,
} from "../utils/helper";

interface OptionListProps {
	options: DropDownOption[];
	initialSelectedOptions: DropDownOption[];
	handleSelectOption: (options: DropDownOption[]) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
	options,
	initialSelectedOptions,
	handleSelectOption,
}) => {
	const [selectedOptions, setSelectedOptions] = useState<DropDownOption[]>(
		initialSelectedOptions,
	);
	const [filteredOptions, setFilteredOptions] = useState<DropDownOption[]>(
		options,
	);
	const [searchValue, setSearchValue] = useState("");
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const optionContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setFilteredOptions(() => {
			return options.filter((option) => {
				const displayValue = getDisplayValue(option);
				return displayValue
					.toLowerCase()
					.includes(searchValue.toLowerCase());
			});
		});
	}, [options, searchValue]);

	useEffect(() => {
		setSelectedOptions(initialSelectedOptions);
	}, [initialSelectedOptions]);

	useEffect(() => {
		if (searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, []);

	const handleOptionClick = (option: DropDownOption) => {
		setSelectedOptions((prev) => {
			let updatedOptions: DropDownOption[];
			if (isOptionSelected(option, prev)) {
				if (typeof option === "string") {
					updatedOptions = prev.filter(
						(opt) => typeof opt === "string" && opt !== option,
					);
				} else {
					updatedOptions = prev.filter(
						(opt) =>
							typeof opt === "string" ||
							(opt !== null && opt.label !== option.label),
					);
				}
			} else {
				updatedOptions = [...prev, option];
			}

			handleSelectOption(updatedOptions);

			return updatedOptions;
		});
	};

	useEffect(() => {
		const optionContainer = optionContainerRef.current;
		if (!optionContainer) return;

		const handleWheel = (e: WheelEvent) => {
			e.stopPropagation();

			const { scrollTop, scrollHeight, clientHeight } = optionContainer;
			const isScrollable = scrollHeight > clientHeight;

			if (!isScrollable) {
				e.preventDefault();
				return;
			}

			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
				e.preventDefault();
			}
		};

		optionContainer.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		return () => {
			optionContainer.removeEventListener("wheel", handleWheel);
		};
	}, []);

	return (
		<div
			className="flex flex-col w-full max-h-[300px] bg-white box-border"
			data-dropdown-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => {
				e.stopPropagation();
			}}
		>
			<div className="relative flex items-center px-3 py-2 border-b border-[#e0e0e0]">
				<svg
					className="absolute left-5 text-[#9e9e9e] pointer-events-none"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					ref={searchFieldRef}
					type="text"
					className="w-full py-2 pl-9 pr-3 border border-[#e0e0e0] rounded text-sm outline-none transition-colors focus:border-[#212121]"
					placeholder="Find your option"
					value={searchValue}
					onChange={(e) => {
						setSearchValue(e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
				/>
				{searchValue && (
					<button
						className="absolute right-5 bg-transparent border-none cursor-pointer p-1 text-[#9e9e9e] flex items-center justify-center transition-colors hover:text-[#757575]"
						onClick={(e) => {
							e.stopPropagation();
							setSearchValue("");
							searchFieldRef.current?.focus();
						}}
						type="button"
						aria-label="Clear search"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				)}
			</div>

			<div ref={optionContainerRef} className="flex-1 overflow-y-auto max-h-[250px] w-full scrollbar-thin">
				{filteredOptions.length === 0 ? (
					<div className="py-5 text-center text-[#9e9e9e] text-sm">
						No options found
					</div>
				) : (
					filteredOptions.map((option, idx) => {
						const displayValue = getDisplayValue(option);
						const itemKey = getItemKey(option, idx);
						const isSelected = isOptionSelected(option, selectedOptions);

						return (
							<div
								key={itemKey}
								className="flex items-center px-4 py-2 cursor-pointer transition-colors hover:bg-[#f5f5f5]"
								onClick={(e) => {
									e.stopPropagation();
									handleOptionClick(option);
								}}
							>
								<input
									type="checkbox"
									checked={isSelected}
									onChange={() => handleOptionClick(option)}
									onClick={(e) => e.stopPropagation()}
									className="mr-3 cursor-pointer w-[18px] h-[18px] accent-[#212121]"
								/>
								<label className="text-sm cursor-pointer flex-1 select-none">
									{displayValue}
								</label>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};
