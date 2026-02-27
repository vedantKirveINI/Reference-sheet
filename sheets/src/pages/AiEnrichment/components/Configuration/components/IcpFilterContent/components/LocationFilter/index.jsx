import ODSAutocomplete from "oute-ds-autocomplete";
import ODSChip from "oute-ds-chip";
import Icon from "oute-ds-icon";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";

import {
	LOCATION_FIELD_MAPPING,
	LOCATION_FIELD_ORDER,
	filterLocationOptions,
} from "../../constants/locationConstants";

import styles from "./styles.module.scss";

function LocationFilter(
	{ data: _data = {}, sectionId = "", onFilterCountChange, onFilterChange },
	ref,
) {
	// Unified state for all location filters - all arrays of objects with id, label, value
	const [locationState, setLocationState] = useState({
		countriesInclude: [],
		countriesExclude: [],
		statesInclude: [],
		statesExclude: [],
		citiesInclude: [],
		citiesExclude: [],
	});

	// State for search terms for each field
	const [searchTerms, setSearchTerms] = useState({
		countriesInclude: "",
		countriesExclude: "",
		statesInclude: "",
		statesExclude: "",
		citiesInclude: "",
		citiesExclude: "",
	});

	const handleChange = (type, newValue) => {
		const updatedState = {
			...locationState,
			[type]: newValue || [],
		};

		setLocationState(updatedState);

		// Call onFilterChange with the updated state for manual changes
		if (onFilterChange && sectionId) {
			onFilterChange(sectionId, updatedState, true); // isManualChange = true
		}
	};

	const handleSearchChange = (fieldKey, searchValue) => {
		setSearchTerms((prev) => ({
			...prev,
			[fieldKey]: searchValue,
		}));
	};

	// Calculate and report filter count whenever locationState changes
	useEffect(() => {
		if (onFilterCountChange && sectionId) {
			const totalFilters = Object.values(locationState).reduce(
				(total, array) => {
					return (
						total + (array && array.length > 0 ? array.length : 0)
					);
				},
				0,
			);
			onFilterCountChange(sectionId, totalFilters);
		}
	}, [locationState, onFilterCountChange, sectionId]);

	// Function to get filtered options for each field
	const getFilteredOptions = (fieldKey) => {
		const fieldConfig = LOCATION_FIELD_MAPPING[fieldKey];
		const searchTerm = searchTerms[fieldKey];
		const selectedItems = locationState[fieldConfig.stateKey];

		let baseOptions = fieldConfig.options;

		// If user is searching, filter from complete list
		if (searchTerm && searchTerm.length >= 2) {
			const filtered = filterLocationOptions(
				fieldConfig.allOptions,
				searchTerm,
				50,
			);

			// Convert filtered results to option format
			baseOptions = filtered.map((option, index) => ({
				id: `${fieldKey}_filtered_${index}`,
				label: option,
				value: option,
			}));
		}

		// Always include selected items that might not be in the base options
		const selectedOptionsNotInBase = selectedItems.filter(
			(selectedItem) =>
				!baseOptions.some(
					(option) => option.value === selectedItem.value,
				),
		);

		// Combine base options with selected items not in base
		const combinedOptions = [...baseOptions, ...selectedOptionsNotInBase];

		// Remove duplicates based on value
		const uniqueOptions = combinedOptions.filter(
			(option, index, self) =>
				index === self.findIndex((o) => o.value === option.value),
		);

		return uniqueOptions;
	};

	const RenderChipField = (fieldKey) => {
		const fieldConfig = LOCATION_FIELD_MAPPING[fieldKey];
		const selectedItems = locationState[fieldConfig.stateKey];
		const filteredOptions = getFilteredOptions(fieldKey);

		return (
			<div className={styles.field_container}>
				<label className={styles.field_label}>
					{fieldConfig.label}
				</label>
				<div className={styles.select_container}>
					<ODSAutocomplete
						searchable={true}
						variant="black"
						multiple
						slotProps={{
							popper: {
								sx: {
									"& .MuiPaper-root": {
										boxShadow:
											"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
										borderRadius: "0.5rem",
										border: "1px solid #e5e7eb",
									},
								},
							},
						}}
						ListboxProps={{
							"data-testid": "ods-autocomplete-listbox",
							style: {
								maxHeight: "18.75rem",
								padding: "0.375rem",
								display: "flex",
								flexDirection: "column",
								gap: "0.375rem",
							},
						}}
						disablePortal={true}
						value={selectedItems}
						options={filteredOptions}
						getOptionLabel={(option) => option?.label}
						isOptionEqualToValue={(option, value) =>
							option.id === value.id
						}
						onChange={(e, val) =>
							handleChange(fieldConfig.stateKey, val)
						}
						onInputChange={(e, value) => {
							handleSearchChange(fieldKey, value);
						}}
						sx={{
							width: "100%",
							minWidth: "100%",
							"& .MuiInputBase-root": {
								borderRadius: "0.375rem",
								width: "100%",
							},
							"& .MuiAutocomplete-inputRoot": {
								width: "100%",
							},
						}}
						renderTags={(value, getTagProps) => (
							<div className={styles.tags_container}>
								{value.map((option, index) => {
									const { key, ...tagProps } = getTagProps({
										index,
									});

									return (
										<ODSChip
											label={option?.label || ""}
											key={key}
											{...tagProps}
											size="small"
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
									);
								})}
							</div>
						)}
						placeholder={
							selectedItems.length === 0
								? fieldConfig.placeholder
								: ""
						}
						disableClearable
					/>
				</div>
			</div>
		);
	};

	useImperativeHandle(
		ref,
		() => ({
			getFilterData() {
				return new Promise((resolve, _reject) => {
					resolve(locationState);
				});
			},
		}),
		[locationState],
	);

	return (
		<div className={styles.icp_fields_container}>
			{LOCATION_FIELD_ORDER.map((fieldKey) => (
				<div key={fieldKey}>{RenderChipField(fieldKey)}</div>
			))}
		</div>
	);
}

export default forwardRef(LocationFilter);
