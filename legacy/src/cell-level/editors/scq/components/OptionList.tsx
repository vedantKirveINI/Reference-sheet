import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import ODSIcon from "@/lib/oute-icon";

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
			className="flex flex-col w-full max-h-[300px] bg-white border border-[#e0e0e0] rounded-md shadow-md box-border"
			data-scq-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => e.stopPropagation()}
		>
			<div className="py-2.5 px-3 border-b border-[#e0e0e0]">
				<div className="relative flex items-center">
					<span className="absolute left-2 text-[#90a4ae] pointer-events-none">
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
					</span>
					<input
						ref={searchFieldRef}
						className="w-full pl-8 pr-8 py-2 border border-[#e0e0e0] rounded-md text-sm outline-none focus:border-[#212121]"
						placeholder="Find your option"
						value={searchValue}
						autoFocus
						onChange={handleSearchChange}
					/>
					{searchValue && (
						<button
							className="absolute right-2 bg-transparent border-none cursor-pointer p-0 flex items-center justify-center"
							onClick={handleClearSearch}
							type="button"
						>
							<ODSIcon
								outeIconName="OUTECloseIcon"
								outeIconProps={{
									sx: {
										height: "1.1rem",
										width: "1.1rem",
										cursor: "pointer",
									},
								}}
							/>
						</button>
					)}
				</div>
			</div>

			<div ref={optionContainerRef} className="flex-1 overflow-y-auto max-h-[250px] py-2 w-full">
				{filteredOptions.length === 0 ? (
					<div className="py-3 px-4 text-[#90a4ae] text-sm">
						No options found
					</div>
				) : (
					filteredOptions.map((option) => (
						<label
							key={option}
							className="flex items-center gap-2 py-2 px-4 cursor-pointer text-sm text-[#212121] hover:bg-gray-100"
						>
							<input
								type="radio"
								name={radioGroupName}
								checked={selectedOption === option}
								onChange={() => onSelectOption(option)}
								value={option}
								className="accent-[#212121] cursor-pointer"
							/>
							<span>{option}</span>
						</label>
					))
				)}
			</div>
		</div>
	);
};
