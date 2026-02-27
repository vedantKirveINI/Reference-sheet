import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import InputMask from "react-input-mask";

import { MERIDIEM_OPTIONS } from "../../../QuestionType/Time/constants";

import useTimeFieldHandler from "./hooks/useTimeFieldHandler";
import styles from "./styles.module.scss";

function TimeField({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const {
		timeValue,
		isDropdownOpen,
		inputRef,
		triggerRef,
		isTwentyFourHour,
		handleTimeChange,
		handleMeridiemChange,
		toggleDropdown,
		setIsDropdownOpen,
	} = useTimeFieldHandler({ value, onChange, field, fieldIndex });

	return (
		<div
			className={styles.time_field_container}
			data-testid="date-time-expanded-row"
		>
			<div className={styles.time_input_container}>
				<InputMask
					mask="99:99"
					maskChar={null}
					value={timeValue.time}
					onChange={handleTimeChange}
					placeholder="HH:MM"
					data-testid="time-input"
				>
					{(inputProps) => (
						<input
							{...inputProps}
							ref={inputRef}
							className={styles.time_input}
							placeholder="HH:MM"
						/>
					)}
				</InputMask>

				{!isTwentyFourHour && (
					<div className={styles.meridiem_container}>
						<span className={styles.vertical_line} />
						<div
							className={styles.meridiem_selector}
							ref={triggerRef}
							onClick={toggleDropdown}
							data-testid="meridiem-selector"
						>
							{timeValue.meridiem}
							<ODSIcon
								outeIconName={
									isDropdownOpen
										? "OUTEExpandLessIcon"
										: "OUTEExpandMoreIcon"
								}
								outeIconProps={{
									sx: {
										width: "1.25rem",
										height: "1.25rem",
										color: "#000",
									},
								}}
							/>
						</div>
					</div>
				)}
			</div>

			<ODSPopover
				open={isDropdownOpen}
				anchorEl={triggerRef.current}
				onClose={() => setIsDropdownOpen(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "left" }}
				slotProps={{
					paper: {
						sx: {
							padding: "0.5rem",
							borderRadius: "0.375rem",
							border: "0.0469rem solid #cfd8dc",
						},
					},
				}}
				hideBackdrop={true}
			>
				{MERIDIEM_OPTIONS.map((option) => (
					<div
						key={option}
						className={styles.meridiem_option}
						onClick={() => handleMeridiemChange(option)}
					>
						{option}
					</div>
				))}
			</ODSPopover>
		</div>
	);
}

export default TimeField;
