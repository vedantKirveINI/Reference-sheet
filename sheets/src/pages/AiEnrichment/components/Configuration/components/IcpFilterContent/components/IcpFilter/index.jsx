import ODSChip from "oute-ds-chip";
import Icon from "oute-ds-icon";
import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import TextField from "oute-ds-text-field";
import {
	useState,
	useEffect,
	useRef,
	forwardRef,
	useImperativeHandle,
} from "react";

import useIcpFilterContent from "../../hooks/useIcpFilterContent";

import styles from "./styles.module.scss";

function IcpFilter(
	{
		data = {},
		sectionId = "",
		onFilterCountChange = () => {},
		onFilterChange = () => {},
	},
	ref,
) {
	const { formFields = [] } = useIcpFilterContent(data);

	// State to track selected values for each field
	const [selectedValues, setSelectedValues] = useState({});
	// State to track available options for each field (including newly added ones)
	const [fieldOptions, setFieldOptions] = useState({});
	// State to track search values for each field
	const [searchValues, setSearchValues] = useState({});
	// State to track if dropdown is open for each field
	const [openStates, setOpenStates] = useState({});
	// Refs for anchor elements
	const anchorRefs = useRef({});

	// Convert field values to options format for ODSAutocomplete
	const convertToOptions = (values) => {
		return values.map((value, index) => {
			const displayValue =
				typeof value === "object"
					? JSON.stringify(value)
					: String(value);

			return {
				id: `${displayValue}_${index}`,
				label: displayValue,
				value: value,
			};
		});
	};

	// Initialize selected values and options with existing field values when formFields change
	useEffect(() => {
		if (formFields.length > 0) {
			const initialValues = {};
			const initialOptions = {};
			const initialSearchValues = {};
			const initialOpenStates = {};
			formFields.forEach((field) => {
				const options = convertToOptions(field.value);
				initialValues[field.key] = options;
				initialOptions[field.key] = options;
				initialSearchValues[field.key] = "";
				initialOpenStates[field.key] = false;
			});
			setSelectedValues(initialValues);
			setFieldOptions(initialOptions);
			setSearchValues(initialSearchValues);
			setOpenStates(initialOpenStates);
		}
	}, [formFields]);

	// Calculate and report filter count whenever selectedValues changes
	useEffect(() => {
		if (onFilterCountChange && sectionId) {
			const totalFilters = Object.values(selectedValues).reduce(
				(total, array) => {
					return (
						total + (array && array.length > 0 ? array.length : 0)
					);
				},
				0,
			);
			onFilterCountChange(sectionId, totalFilters);
		}
	}, [selectedValues, onFilterCountChange, sectionId]);

	const handleChange = (fieldKey, newValue) => {
		const updatedValues = {
			...selectedValues,
			[fieldKey]: newValue || [],
		};

		setSelectedValues(updatedValues);

		// Call onFilterChange with the updated values for manual changes
		if (onFilterChange && sectionId) {
			onFilterChange(sectionId, updatedValues, true); // isManualChange = true
		}
	};

	// Handle search input change
	const handleSearchChange = (fieldKey, searchValue) => {
		setSearchValues((prev) => ({
			...prev,
			[fieldKey]: searchValue,
		}));
	};

	// Filter options based on search
	const getFilteredOptions = (fieldKey) => {
		const options = fieldOptions[fieldKey] || [];
		const searchValue = searchValues[fieldKey] || "";

		if (!searchValue) return options;

		return options.filter((option) =>
			option.label.toLowerCase().includes(searchValue.toLowerCase()),
		);
	};

	// Handle adding new option when user presses Enter in search field
	const handleSearchKeyDown = (event, fieldKey) => {
		if (event.key === "Enter") {
			event.preventDefault();
			const inputValue = event.target.value.trim();

			if (inputValue) {
				// Check if option already exists
				const currentOptions = fieldOptions[fieldKey] || [];
				const optionExists = currentOptions.some(
					(option) =>
						option.label.toLowerCase() === inputValue.toLowerCase(),
				);

				if (!optionExists) {
					// Create new option
					const newOption = {
						id: `${inputValue}_${Date.now()}`,
						label: inputValue,
						value: inputValue,
					};

					// Add to options
					setFieldOptions((prev) => ({
						...prev,
						[fieldKey]: [...currentOptions, newOption],
					}));

					// Add to selected values
					setSelectedValues((prev) => ({
						...prev,
						[fieldKey]: [...(prev[fieldKey] || []), newOption],
					}));

					// Clear the search
					setSearchValues((prev) => ({
						...prev,
						[fieldKey]: "",
					}));
				}
			}
		}
	};

	useImperativeHandle(
		ref,
		() => ({
			getFilterData() {
				return new Promise((resolve, _reject) => {
					resolve(selectedValues);
				});
			},
		}),
		[selectedValues],
	);

	// Toggle dropdown open state
	const toggleDropdown = (fieldKey) => {
		setOpenStates((prev) => ({
			...prev,
			[fieldKey]: !prev[fieldKey],
		}));
	};

	// Close dropdown
	const closeDropdown = (fieldKey) => {
		setOpenStates((prev) => ({
			...prev,
			[fieldKey]: false,
		}));
	};

	const RenderChipField = (field) => {
		const selectedItems = selectedValues[field.key] || [];
		const filteredOptions = getFilteredOptions(field.key);
		const searchValue = searchValues[field.key] || "";
		const isOpen = openStates[field.key] || false;

		return (
			<div key={field.key} className={styles.field_container}>
				<label className={styles.field_label}>{field.label}:</label>
				<div className={styles.select_container}>
					{/* Selected chips display */}
					<div
						ref={(el) => (anchorRefs.current[field.key] = el)}
						className={styles.chips_display}
						onClick={() => toggleDropdown(field.key)}
					>
						<div className={styles.tags_container}>
							{selectedItems.map((option, index) => (
								<ODSChip
									label={option?.label || option}
									key={`${field.key}_${index}`}
									size="small"
									onDelete={() => {
										const newSelected =
											selectedItems.filter(
												(_, i) => i !== index,
											);
										handleChange(field.key, newSelected);
									}}
									deleteIcon={
										<Icon
											outeIconName="OUTECloseIcon"
											outeIconProps={{
												sx: {
													width: "12px",
													height: "12px",
													color: "#6b7280",
												},
											}}
										/>
									}
									sx={{
										backgroundColor: "#f3f4f6",
										color: "#374151",
										border: "1px solid #e5e7eb",
										"&:hover": {
											backgroundColor: "#e5e7eb",
										},
									}}
								/>
							))}
						</div>
						<ODSIcon
							outeIconName={
								isOpen
									? "OUTEExpandLessIcon"
									: "OUTEExpandMoreIcon"
							}
							outeIconProps={{
								sx: {
									width: "16px",
									height: "16px",
									color: "#6b7280",
								},
							}}
						/>
					</div>

					{/* ODSPopover for dropdown */}
					<ODSPopover
						open={isOpen}
						anchorEl={anchorRefs.current[field.key]}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "left",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "left",
						}}
						onClose={() => closeDropdown(field.key)}
						sx={{
							"& .MuiPaper-root": {
								minWidth: "300px",
								maxWidth: "400px",
								maxHeight: "400px",
								boxShadow:
									"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
								borderRadius: "0.375rem",
								border: "1px solid #d1d5db",
							},
						}}
					>
						<div className={styles.popover_content}>
							{/* Search field */}
							<div className={styles.search_field_container}>
								<TextField
									fullWidth
									className="black"
									placeholder={`Search ${field.label.toLowerCase()}...`}
									value={searchValue}
									autoFocus={true}
									onChange={(e) => {
										handleSearchChange(
											field.key,
											e.target.value,
										);
									}}
									onKeyDown={(e) =>
										handleSearchKeyDown(e, field.key)
									}
									sx={{
										flex: 1,
										".MuiInputBase-root": {
											borderRadius: "0.375rem",
										},
									}}
									InputProps={{
										startAdornment: (
											<Icon
												outeIconName="OUTESearchIcon"
												outeIconProps={{
													sx: {
														height: "1.25rem",
														width: "1.25rem",
													},
												}}
											/>
										),
										endAdornment: searchValue && (
											<Icon
												outeIconName="OUTECloseIcon"
												outeIconProps={{
													sx: {
														height: "1.25rem",
														width: "1.25rem",
														pointerEvents:
															"all !important",
														cursor: "pointer",
													},
												}}
												buttonProps={{
													sx: {
														padding: 0,
													},
												}}
												onClick={() => {
													handleSearchChange(
														field.key,
														"",
													);
												}}
											/>
										),
									}}
								/>
							</div>

							{/* Options list */}
							<div className={styles.options_list}>
								{filteredOptions.length > 0 ? (
									filteredOptions.map((option) => {
										const isSelected = selectedItems.some(
											(selected) =>
												selected.id === option.id,
										);

										return (
											<div
												key={option.id}
												className={`${styles.option_item} ${isSelected ? styles.selected : ""}`}
												onClick={() => {
													if (isSelected) {
														// Remove from selected
														const newSelected =
															selectedItems.filter(
																(selected) =>
																	selected.id !==
																	option.id,
															);
														handleChange(
															field.key,
															newSelected,
														);
													} else {
														// Add to selected
														handleChange(
															field.key,
															[
																...selectedItems,
																option,
															],
														);
													}
												}}
											>
												<span
													className={
														styles.option_text
													}
												>
													{option.label}
												</span>
												{isSelected && (
													<Icon
														outeIconName="OUTECheckIcon"
														outeIconProps={{
															sx: {
																width: "16px",
																height: "16px",
																color: "#10b981",
															},
														}}
													/>
												)}
											</div>
										);
									})
								) : (
									<div className={styles.no_options_text}>
										No options found. Press Enter to add "
										{field.label.toLowerCase()}"
									</div>
								)}
							</div>
						</div>
					</ODSPopover>
				</div>
			</div>
		);
	};

	return (
		<div className={styles.icp_fields_container}>
			{formFields.map((field) => RenderChipField(field))}
		</div>
	);
}

export default forwardRef(IcpFilter);
