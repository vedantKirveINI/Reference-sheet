import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";
import styles from "./OptionList.module.css";

interface OptionListProps {
	options: string[];
	selectedOption: string | null;
	onSelectOption: (option: string) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
	options,
	selectedOption,
	onSelectOption,
}) => {
	const [searchValue, setSearchValue] = useState("");
	const radioGroupName = useId();
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const optionContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		searchFieldRef.current?.focus();
	}, []);

	const filteredOptions = useMemo(() => {
		return options.filter((option) =>
			option.toLowerCase().includes(searchValue.toLowerCase()),
		);
	}, [options, searchValue]);

	const handleClearSearch = () => {
		setSearchValue("");
		searchFieldRef.current?.focus();
	};

	const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchValue(event.target.value);
	};

	// Handle mouse wheel scrolling in option list (same pattern as MCQ OptionList)
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
			className={styles.option_list_container}
			data-scq-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => e.stopPropagation()}
		>
			<div className={styles.search_container}>
				<ODSTextField
					fullWidth
					className="black"
					inputRef={searchFieldRef}
					placeholder="Find your option"
					value={searchValue}
					autoFocus
					onChange={handleSearchChange}
					InputProps={{
						startAdornment: (
							<ODSIcon
								outeIconName="OUTESearchIcon"
								outeIconProps={{
									sx: {
										height: "1.25rem",
										width: "1.25rem",
										color: "#90a4ae",
									},
								}}
							/>
						),
						endAdornment: searchValue && (
							<ODSIcon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										height: "1.1rem",
										width: "1.1rem",
										cursor: "pointer",
									},
								}}
								buttonProps={{
									sx: { padding: 0 },
									onClick: handleClearSearch,
								}}
								onClick={handleClearSearch}
							/>
						),
					}}
					sx={{
						width: "100%",
						".MuiInputBase-root": {
							borderRadius: "0.375rem",
						},
					}}
				/>
			</div>

			<div ref={optionContainerRef} className={styles.option_container}>
				{filteredOptions.length === 0 ? (
					<div className={styles.option_not_found}>
						No options found
					</div>
				) : (
					filteredOptions.map((option) => (
						<label
							key={option}
							className={styles.radio_option_wrapper}
						>
							<input
								type="radio"
								name={radioGroupName}
								checked={selectedOption === option}
								onChange={() => onSelectOption(option)}
								value={option}
							/>
							<span>{option}</span>
						</label>
					))
				)}
			</div>
		</div>
	);
};
