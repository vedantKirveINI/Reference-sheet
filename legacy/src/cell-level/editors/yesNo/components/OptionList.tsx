import React from "react";
import styles from "./OptionList.module.css";

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
		<div className={styles.option_list} data-yesno-option-list>
			{options.map((option) => (
				<label key={option} className={styles.option_row}>
					<input
						type="radio"
						checked={selectedOption === option}
						onChange={() => onSelectOption(option)}
					/>
					<span>{option}</span>
				</label>
			))}
		</div>
	);
};


