import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import dayjs from "dayjs";
import Button from "oute-ds-button";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { useImperativeHandle, useRef } from "react";

import { CALENDER_ICON } from "../../constants/Icons/questionTypeIcons";
import getField from "../../form/getField";

import { dateControls, timeControls } from "./config/dateTimeControls";
import { useDateTimePicker } from "./hooks/useDateTimePicker";
import styles from "./styles.module.scss";
import getDateTimeFormat from "./utils/getDateFormat";

const MAX_DATE = dayjs("9999/12/31");
const MIN_DATE = dayjs("0100/01/01");

function DateTimePicker({
	sx = {},
	value = null,
	onChange = () => {},
	onSubmit = () => {},
	dateFormat = "DDMMYYYY",
	separator = "/",
	isTwentyFourHourFormat = false,
	includeTime = false,
	hideBorders = false,
	inputRef,
	inputFocus = true,
	onPopperChange = () => {},
	onPopoverBlur = () => {},
	disablePortal = false,
}) {
	const dateTimeFieldRef = useRef(null);

	const {
		dateTimeVal,
		formHook,
		setDateTimeVal,
		onSubmitHandler,
		isPickerOpen,
		setIsPickerOpen,
		dateTimeInputRef,
		currentMeridiem,
		popperRef,
	} = useDateTimePicker({
		value,
		onSubmit,
		onPopperChange,
		onPopoverBlur,
		inputFocus,
	});

	const { control, handleSubmit } = formHook;

	const format = getDateTimeFormat({
		dateFormat,
		isTwentyFourHourFormat,
		separator,
		includeTime,
	});

	const fieldMeridiemPlaceholder = () =>
		isTwentyFourHourFormat ? "" : currentMeridiem;

	useImperativeHandle(
		inputRef,
		() => ({
			field: dateTimeFieldRef.current,
			input: dateTimeInputRef.current,
		}),
		[dateTimeInputRef],
	);

	const Component = includeTime ? DateTimeField : DateField;

	return (
		<LocalizationProvider
			dateAdapter={AdapterDayjs}
			localeText={{
				fieldMeridiemPlaceholder,
			}}
		>
			<div className={styles.date_field_container}>
				<Component
					ref={dateTimeFieldRef}
					inputRef={dateTimeInputRef}
					format={format}
					value={dateTimeVal}
					maxDate={MAX_DATE}
					minDate={MIN_DATE}
					slotProps={{
						textField: {
							inputProps: {
								"data-testid": "date-time-field-input",
							},
						},
					}}
					sx={{
						"&.MuiFormControl-root": {
							width: "100%",
						},
						".MuiInputBase-input": {
							padding: "0.53rem 0.875rem",
						},
						".MuiInputBase-root": {
							borderRadius: "0.75rem",
						},
						...sx,
						...(hideBorders
							? {
									".MuiOutlinedInput-notchedOutline": {
										border: "none",
									},
								}
							: {
									".MuiOutlinedInput-notchedOutline": {
										border: "0.125rem solid #212121 !important",
									},
								}),
					}}
					onChange={(newVal) => {
						setDateTimeVal(newVal);

						if (newVal) {
							onChange(newVal.toISOString());
						} else {
							onChange(null);
						}
					}}
					onFocus={() => {
						if (isPickerOpen) {
							setIsPickerOpen(false);
						}
					}}
					onError={(error, value) => {
						if (error) {
							setDateTimeVal(value);
							onChange(value);
						}
					}}
				/>
				<span
					className={styles.calender_svg}
					onClick={() => {
						setIsPickerOpen((p) => !p);
					}}
					data-testid="calender-icon"
				>
					<Icon
						imageProps={{
							src: CALENDER_ICON,
							className: styles.calender_icon,
						}}
					/>
				</span>
			</div>

			<ODSPopper
				open={isPickerOpen}
				placement="bottom-start"
				anchorEl={dateTimeFieldRef.current}
				sx={{
					zIndex: 1400,
				}}
				onClose={() => setIsPickerOpen(false)}
				disablePortal={disablePortal}
				modifiers={[
					{
						name: "preventOverflow",
						options: {
							boundary: "viewport",
							padding: 8,
						},
					},
					{
						name: "flip",
						options: {
							fallbackPlacements: [
								"top-start",
								"top-end",
								"bottom-start",
								"bottom-end",
								"left-start",
								"right-start",
							],
						},
					},
					{
						name: "offset",
						options: {
							offset: [0, 8],
						},
					},
				]}
			>
				<div
					className={styles.popper_container}
					ref={popperRef}
					data-testid="date-time-popover"
				>
					<div style={{ maxHeight: "22rem", overflowY: "auto" }}>
						{dateControls.map((config) => {
							const { name, type } = config;
							const Element = getField(type);
							return (
								<Element
									key={name}
									{...config}
									control={control}
								/>
							);
						})}

						{includeTime ? (
							<div className={styles.time_container}>
								{timeControls.map((config) => {
									const { name, type, label } = config;
									const Element = getField(type);
									return (
										<div key={name}>
											<p className={styles.time_lable}>
												{label}
											</p>

											<Element
												key={name}
												{...config}
												control={control}
											/>
										</div>
									);
								})}
							</div>
						) : null}
					</div>

					<div className={styles.footer}>
						<Button
							variant="black"
							onClick={handleSubmit(onSubmitHandler)}
						>
							OK
						</Button>
					</div>
				</div>
			</ODSPopper>
		</LocalizationProvider>
	);
}

export default DateTimePicker;
