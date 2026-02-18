import React, { useEffect, useRef, useState } from "react";
import styles from "../../mcq/components/OptionList.module.css";

interface OptionListProps {
	options: string[];
	initialSelectedOptions: string[];
	handleSelectOption: (options: string[]) => void;
	handleAddNewOption: (newOption: string) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
	options,
	initialSelectedOptions,
	handleSelectOption,
	handleAddNewOption,
}) => {
	const [selectedOptions, setSelectedOptions] = useState<string[]>(
		initialSelectedOptions,
	);
	const [filteredOptions, setFilteredOptions] = useState<string[]>(options);
	const [searchValue, setSearchValue] = useState("");
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const optionContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setFilteredOptions(() =>
			options.filter((option) =>
				option.toLowerCase().includes(searchValue.toLowerCase()),
			),
		);
	}, [options, searchValue]);

	useEffect(() => {
		setSelectedOptions(initialSelectedOptions);
	}, [initialSelectedOptions]);

	useEffect(() => {
		searchFieldRef.current?.focus();
	}, []);

	const handleOptionClick = (option: string) => {
		setSelectedOptions((prev) => {
			let updated: string[];
			if (prev.includes(option)) {
				updated = prev.filter((opt) => opt !== option);
			} else {
				updated = [...prev, option];
			}
			handleSelectOption(updated);
			return updated;
		});
	};

	// add-new flow when no match
	const showAddOption = searchValue.trim() !== "" && filteredOptions.length === 0;
	const addNewOption = () => {
		const trimmed = searchValue.trim();
		if (!trimmed) return;
		handleAddNewOption(trimmed);
		setSearchValue("");
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
		return () => optionContainer.removeEventListener("wheel", handleWheel);
	}, []);

	return (
		<div
			className={styles.option_list_container}
			data-list-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => e.stopPropagation()}
		>
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
					onChange={(e) => setSearchValue(e.target.value)}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => {
						if (e.key === "Enter" && showAddOption) {
							e.preventDefault();
							e.stopPropagation();
							addNewOption();
						}
					}}
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

			<div ref={optionContainerRef} className={styles.option_container}>
				{showAddOption ? (
					<div
						className={styles.option_not_found}
						style={{ cursor: "pointer" }}
						onClick={(e) => {
							e.stopPropagation();
							addNewOption();
						}}
					>
						Press Enter to add "{searchValue}"
					</div>
				) : filteredOptions.length === 0 ? (
					<div className={styles.option_not_found}>No options found</div>
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
								checked={selectedOptions.includes(option)}
								onChange={() => handleOptionClick(option)}
								onClick={(e) => e.stopPropagation()}
								className={styles.checkbox}
							/>
							<label className={styles.checkbox_label}>{option}</label>
						</div>
					))
				)}
			</div>
		</div>
	);
};

