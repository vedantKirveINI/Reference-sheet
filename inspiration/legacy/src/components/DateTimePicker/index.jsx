import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateField } from "@mui/x-date-pickers/DateField";
import { DateTimeField } from "@mui/x-date-pickers/DateTimeField";
import dayjs from "dayjs";
import Button from "oute-ds-button";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import { useImperativeHandle, useRef, useEffect } from "react";

import getField from "../../common/forms/getField";

import { dateControls, timeControls } from "./config/dateTimeControls";
import { useDateTimePicker } from "./hooks/useDateTimePicker";
import styles from "./styles.module.scss";
import getDateTimeFormat from "./utils/getDateFormat";
import { CALENDER_ICON } from "../../constants/Icons/questionTypeIcons";

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

	// Phase 1: Handle wheel events in popper to prevent canvas scrolling
	// Pattern: Similar to McqEditor's OptionList component
	useEffect(() => {
		if (!isPickerOpen || !popperRef.current) return;

		const popperContainer = popperRef.current;

		const handleWheel = (e) => {
			// Always stop propagation to prevent canvas scrolling
			e.stopPropagation();

			// Find the actual scrollable element (could be popper container or nested element)
			// Check if the event target is within a scrollable element
			let scrollableElement = popperContainer;
			let target = e.target;

			// Traverse up the DOM tree to find a scrollable parent
			while (
				target &&
				target !== popperContainer &&
				target !== document.body
			) {
				if (
					target.scrollHeight > target.clientHeight ||
					target.scrollWidth > target.clientWidth
				) {
					scrollableElement = target;
					break;
				}
				target = target.parentElement;
			}

			// Check if the scrollable element is actually scrollable
			const isScrollable =
				scrollableElement.scrollHeight >
					scrollableElement.clientHeight ||
				scrollableElement.scrollWidth > scrollableElement.clientWidth;

			if (!isScrollable) {
				// Not scrollable: prevent default, don't scroll
				e.preventDefault();
				return;
			}

			// Check vertical scroll boundaries
			const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			// Check horizontal scroll boundaries
			const { scrollLeft, scrollWidth, clientWidth } = scrollableElement;
			const isAtLeft = scrollLeft === 0;
			const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1;

			// If at boundaries and trying to scroll beyond, prevent default
			if (
				(isAtTop && e.deltaY < 0) ||
				(isAtBottom && e.deltaY > 0) ||
				(isAtLeft && e.deltaX < 0) ||
				(isAtRight && e.deltaX > 0)
			) {
				e.preventDefault();
			}
			// Otherwise, allow native scrolling (don't prevent default)
		};

		// Use capture phase to catch events before InfiniteScroller
		popperContainer.addEventListener("wheel", handleWheel, {
			capture: true,
			passive: false,
		});

		return () => {
			popperContainer.removeEventListener("wheel", handleWheel, {
				capture: true,
			});
		};
	}, [isPickerOpen]);

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
					shouldDisableDate={() => false}
					disableFuture={false}
					disablePast={false}
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
									".MuiPickersOutlinedInput-notchedOutline": {
										borderWidth: "0 !important",
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
						// Don't reset on error - allow user to continue typing
						// The value parameter is the previous value or null
						// We want to preserve what the user is typing, not reset to previous value
						// Do nothing - let the user finish typing
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
					{dateControls.map((config) => {
						const { name, type } = config;
						const Element = getField(type);
						return (
							<Element
								key={name}
								{...config}
								control={control}
								sx={{
									"& .MuiDateCalendar-root": {
										overflow: "visible !important",
										maxHeight: "none !important",
									},
									"& .MuiPickersSlideTransition-root": {
										overflow: "visible !important",
										maxHeight: "none !important",
									},
									"& .MuiDayCalendar-root": {
										overflow: "visible !important",
										maxHeight: "none !important",
									},
									"& .MuiPickersCalendarHeader-root": {
										overflow: "visible !important",
										maxHeight: "none !important",
									},
								}}
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
