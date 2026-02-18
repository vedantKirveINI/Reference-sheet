import React from "react";

interface OptionListProps {
	options: string[];
	selectedOption: string | null;
	onSelectOption: (value: string) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
	options,
	selectedOption,
	onSelectOption,
}) => {
	return (
		<div className="flex flex-col py-2" data-yesno-option-list>
			{options.map((option) => (
				<label key={option} className="flex items-center gap-2 py-2 px-4 cursor-pointer text-sm text-[#212121] hover:bg-gray-100">
					<input
						type="radio"
						checked={selectedOption === option}
						onChange={() => onSelectOption(option)}
						className="accent-[#212121] cursor-pointer"
					/>
					<span>{option}</span>
				</label>
			))}
		</div>
	);
};
