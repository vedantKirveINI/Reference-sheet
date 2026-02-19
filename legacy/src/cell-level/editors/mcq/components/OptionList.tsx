// OptionList component with search functionality
// Inspired by sheets project's OptionList component
import React, { useState, useEffect, useRef } from "react";
import styles from "./OptionList.module.css";

interface OptionListProps {
	options: string[];
	initialSelectedOptions: string[];
	handleSelectOption: (options: string[]) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
	options,
	initialSelectedOptions,
	handleSelectOption,
}) => {
	const [selectedOptions, setSelectedOptions] = useState<string[]>(
		initialSelectedOptions,
	);
	const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
	const [searchValue, setSearchValue] = useState("");
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const optionContainerRef = useRef<HTMLDivElement>(null);

	// Filter options based on search
	useEffect(() => {
		setFilteredOptions(() => {
			return options.filter((option) =>
				option.toLowerCase().includes(searchValue.toLowerCase()),
			);
		});
	}, [options, searchValue]);

	// Sync selected options when parent updates (e.g., when removed via chips)
	useEffect(() => {
		setSelectedOptions(initialSelectedOptions);
	}, [initialSelectedOptions]);

	// Auto-focus search field when component mounts
	useEffect(() => {
		if (searchFieldRef.current) {
			searchFieldRef.current.focus();
		}
	}, []);

	/**
	 * Handle option selection/deselection
	 * PATTERN: Updates local state immediately for UI feedback
	 * Does NOT call parent onChange - that's handled on save events (Enter/Tab/blur)
	 * This matches StringEditor pattern: immediate UI feedback, save only on save events
	 */
	const handleOptionClick = (option: string) => {
		setSelectedOptions((prev) => {
			let updatedOptions: string[];
			if (prev.includes(option)) {
				updatedOptions = prev.filter((opt) => opt !== option);
			} else {
				updatedOptions = [...prev, option];
			}

			// PATTERN: Update local state immediately (chips update instantly)
			// NOTE: This does NOT call parent onChange - that's called on save events only
			// This prevents full page re-renders on every selection, matching StringEditor pattern
			handleSelectOption(updatedOptions);

			return updatedOptions;
		});
	};

	// FIX ISSUE 2: Handle mouse wheel scrolling in option list
	useEffect(() => {
		const optionContainer = optionContainerRef.current;
		if (!optionContainer) return;

		const handleWheel = (e: WheelEvent) => {
			// Stop propagation to prevent canvas scrolling
			e.stopPropagation();

			// Allow native scrolling within the container
			const { scrollTop, scrollHeight, clientHeight } = optionContainer;
			const isScrollable = scrollHeight > clientHeight;

			if (!isScrollable) {
				e.preventDefault();
				return;
			}

			// Check if we're at the boundaries
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
				// Prevent scrolling beyond boundaries
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
			className={styles.option_list_container}
			data-mcq-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => {
				// FIX ISSUE 2: Prevent wheel events from reaching canvas
				e.stopPropagation();
			}}
		>
			{/* Search Input */}
			<div className={styles.search_container}>
				<svg
					className={styles.search_icon}
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
					className={styles.search_input}
					placeholder="Find your option"
					value={searchValue}
					onChange={(e) => {
						setSearchValue(e.target.value);
					}}
					onClick={(e) => e.stopPropagation()}
				/>
				{searchValue && (
					<button
						className={styles.clear_search}
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

			{/* Options List */}
			<div ref={optionContainerRef} className={styles.option_container}>
				{filteredOptions.length === 0 ? (
					<div className={styles.option_not_found}>
						No options found
					</div>
				) : (
					filteredOptions.map((option, idx) => (
						<div
							key={`${option}_${idx}`}
							className={styles.checkbox_item}
							onClick={(e) => {
								e.stopPropagation();
								handleOptionClick(option);
							}}
						>
							<input
								type="checkbox"
								checked={selectedOptions?.includes(option)}
								onChange={() => handleOptionClick(option)}
								onClick={(e) => e.stopPropagation()}
								className={styles.checkbox}
							/>
							<label className={styles.checkbox_label}>
								{option}
							</label>
						</div>
					))
				)}
			</div>
		</div>
	);
};
