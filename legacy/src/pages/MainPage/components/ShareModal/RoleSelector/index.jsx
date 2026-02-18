import ROLE_OPTIONS from "../constant";

const RoleSelector = (props) => {
	const {
		value,
		onChange,
		disabled = false,
		placeholder = "Select role",
		hideOptions = [],
		className = "",
		searchable = false,
	} = props || {};

	const filteredOptions = ROLE_OPTIONS.filter(
		(opt) => !hideOptions.includes(opt.value)
	);

	return (
		<select
			className={`min-h-[3.5rem] border rounded-r-md px-2.5 text-sm bg-white ${className} ${
				value?.value === "remove access" ? "text-red-500" : "text-[#212121]"
			}`}
			value={value?.value || ""}
			onChange={(e) => {
				const selected = ROLE_OPTIONS.find((opt) => opt.value === e.target.value);
				if (onChange) {
					onChange(e, selected);
				}
			}}
			disabled={disabled}
			aria-label="Select role"
		>
			{!value && <option value="">{placeholder}</option>}
			{filteredOptions.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
};

export default RoleSelector;
