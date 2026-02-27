import ODSCheckBox from "oute-ds-checkbox";
import ODSIcon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import ODSTextField from "oute-ds-text-field";

import { getChipsColor } from "../../../../../../../utils/assignColours";

import useDropdownStaticFieldHandler from "./hooks/useDropdownStaticFieldHandler";
import styles from "./styles.module.scss";

const DropdownStaticField = ({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) => {
	const {
		currentOptions = [],
		isOpen = false,
		searchValue = "",
		filteredOptions = [],
		containerRef,
		popperRef,
		setIsOpen,
		setSearchValue,
		handleSelectOption = () => {},
	} = useDropdownStaticFieldHandler({ value, onChange, field, fieldIndex });

	return (
		<div
			className={styles.dropdown_static_container}
			ref={containerRef}
			tabIndex={0}
			onClick={(e) => {
				// Don't toggle if click originated from popper
				if (popperRef.current?.contains(e.target)) {
					return;
				}
				setIsOpen((prev) => !prev);
			}}
		>
			<div
				className={`${styles.dropdown_static_input_container} ${isOpen ? styles.selected : ""}`}
				data-testid="dropdown-static-expanded-row"
			>
				<div className={styles.chips_container}>
					{(currentOptions || []).map((option, index) => {
						const bgColor = getChipsColor({
							index,
							type: "scq",
						});

						return (
							<div
								key={index}
								className={styles.chip}
								style={{ backgroundColor: bgColor }}
							>
								<span className={styles.chip_label}>
									{option}
								</span>
								<ODSIcon
									outeIconName="OUTECloseIcon"
									outeIconProps={{
										sx: {
											width: "1.25rem",
											height: "1.25rem",
											cursor: "pointer",
										},
									}}
									buttonProps={{
										sx: {
											padding: 0,
										},
									}}
									onClick={(e) => {
										e.stopPropagation();
										handleSelectOption(option);
									}}
								/>
							</div>
						);
					})}
				</div>

				<div className={styles.toggle_icon}>
					<ODSIcon
						outeIconName={
							isOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon"
						}
						outeIconProps={{
							sx: {
								width: "1.5rem",
								height: "1.5rem",
								cursor: "pointer",
							},
						}}
					/>
				</div>
			</div>

			<ODSPopper
				className={styles.popover_container}
				open={isOpen}
				anchorEl={containerRef.current}
				placement="bottom-start"
			>
				<div ref={popperRef}>
					<ODSTextField
						fullWidth
						className="black"
						placeholder="Find your option"
						value={searchValue}
						autoFocus={true}
						onChange={(e) => {
							setSearchValue(e.target.value);
						}}
						sx={{
							flex: 1,
							".MuiInputBase-root": {
								borderRadius: "0.375rem",
							},
						}}
						InputProps={{
							startAdornment: (
								<ODSIcon
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
								<ODSIcon
									outeIconName="OUTECloseIcon"
									outeIconProps={{
										sx: {
											height: "1.25rem",
											width: "1.25rem",
											pointerEvents: "all !important",
											cursor: "pointer",
										},
									}}
									onClick={() => setSearchValue("")}
								/>
							),
						}}
					/>

					<div className={styles.option_container}>
						{filteredOptions.length === 0 ? (
							<div className={styles.option_not_found}>
								No options found
							</div>
						) : (
							filteredOptions.map((option) => (
								<div
									key={option}
									className={styles.checkbox_item}
									onMouseDown={() => {
										handleSelectOption(option);
									}}
								>
									<ODSCheckBox
										labelText={option}
										labelProps={{
											variant: "body1",
											sx: {
												cursor: "pointer",
											},
										}}
										sx={{
											"&.Mui-checked": {
												color: "#212121",
											},
										}}
										checked={currentOptions.includes(
											option,
										)}
									/>
								</div>
							))
						)}
					</div>
				</div>
			</ODSPopper>
		</div>
	);
};

export default DropdownStaticField;
