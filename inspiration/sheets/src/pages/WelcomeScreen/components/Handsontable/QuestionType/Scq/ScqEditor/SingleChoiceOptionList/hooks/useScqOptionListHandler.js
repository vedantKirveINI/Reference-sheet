import { useState, useEffect, useRef } from "react";

function useScqOptionListHandler({ initialSelectedOption = "", options = [] }) {
	const [selectedOption, setSelectedOption] = useState(
		initialSelectedOption || "",
	);
	const [filteredOptions, setFilteredOptions] = useState(options);
	const [searchValue, setSearchValue] = useState("");

	const searchFieldRef = useRef(null);

	useEffect(() => {
		setFilteredOptions(() => {
			return options.filter((option) =>
				option.toLowerCase().includes(searchValue.toLowerCase()),
			);
		});
	}, [options, searchValue]);

	// Update selected option if changed externally
	useEffect(() => {
		setSelectedOption(initialSelectedOption || "");
	}, [initialSelectedOption]);

	return {
		selectedOption,
		setSelectedOption,
		filteredOptions,
		searchValue,
		setSearchValue,
		searchFieldRef,
	};
}
export default useScqOptionListHandler;
