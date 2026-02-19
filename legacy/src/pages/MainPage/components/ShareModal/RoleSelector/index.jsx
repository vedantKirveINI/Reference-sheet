import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

import ROLE_OPTIONS from "../constant";

import styles from "./styles.module.scss";

const RoleSelector = (props) => {
	const {
		value,
		onChange,
		disabled = false,
		placeholder = "Select role",
		hideOptions = [],
		sx = {},
		searchable = false,
	} = props || {};

	const filteredOptions = ROLE_OPTIONS.filter(
		(opt) => !hideOptions.includes(opt.value),
	);

	return (
		<Select
			value={value?.value || ""}
			onValueChange={(newValue) => {
				const option = ROLE_OPTIONS.find((o) => o.value === newValue);
				if (onChange) {
					onChange(null, option);
				}
			}}
			disabled={disabled}
		>
			<SelectTrigger
				style={{
					minHeight: "2.5rem",
					color: value?.value === "remove access" ? "#ff0000" : "#212121",
					...sx,
				}}
				data-testid={props["data-testid"]}
			>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent style={{ minWidth: "20rem" }}>
				{filteredOptions.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						<div className={styles.role_container}>
							<span style={{ fontSize: "0.875rem", color: "#212121" }}>
								{option.label}
							</span>
							{option.description && (
								<span style={{ fontSize: "0.75rem", color: "#607D8B" }}>
									{option.description}
								</span>
							)}
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};

export default RoleSelector;
