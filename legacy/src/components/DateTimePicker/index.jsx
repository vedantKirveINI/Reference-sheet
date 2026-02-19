import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { useImperativeHandle, useRef, useEffect, useState } from "react";

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
	const dateInputRef = useRef(null);

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

	useImperativeHandle(
		inputRef,
		() => ({
			field: dateTimeFieldRef.current,
			input: dateInputRef.current || dateTimeInputRef.current,
		}),
		[dateTimeInputRef],
	);

	useEffect(() => {
		if (!isPickerOpen || !popperRef.current) return;

		const popperContainer = popperRef.current;

		const handleWheel = (e) => {
			e.stopPropagation();

			let scrollableElement = popperContainer;
			let target = e.target;

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

			const isScrollable =
				scrollableElement.scrollHeight >
					scrollableElement.clientHeight ||
				scrollableElement.scrollWidth > scrollableElement.clientWidth;

			if (!isScrollable) {
				e.preventDefault();
				return;
			}

			const { scrollTop, scrollHeight, clientHeight } = scrollableElement;
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			const { scrollLeft, scrollWidth, clientWidth } = scrollableElement;
			const isAtLeft = scrollLeft === 0;
			const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1;

			if (
				(isAtTop && e.deltaY < 0) ||
				(isAtBottom && e.deltaY > 0) ||
				(isAtLeft && e.deltaX < 0) ||
				(isAtRight && e.deltaX > 0)
			) {
				e.preventDefault();
			}
		};

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

	const formatDateForInput = (val) => {
		if (!val) return "";
		const d = dayjs(val);
		if (!d.isValid()) return "";
		if (includeTime) {
			return d.format("YYYY-MM-DDTHH:mm");
		}
		return d.format("YYYY-MM-DD");
	};

	const handleDateChange = (e) => {
		const newVal = e.target.value;
		if (newVal) {
			const d = dayjs(newVal);
			if (d.isValid()) {
				setDateTimeVal(d);
				onChange(d.toISOString());
			}
		} else {
			setDateTimeVal(null);
			onChange(null);
		}
	};

	return (
		<div className={styles.date_field_container} ref={dateTimeFieldRef}>
			<input
				ref={dateInputRef}
				type={includeTime ? "datetime-local" : "date"}
				value={formatDateForInput(dateTimeVal)}
				onChange={handleDateChange}
				data-testid="date-time-field-input"
				style={{
					width: "100%",
					padding: "0.53rem 0.875rem",
					borderRadius: "0.75rem",
					border: hideBorders ? "none" : "0.125rem solid #212121",
					fontSize: "14px",
					fontFamily: "Inter, sans-serif",
					outline: "none",
				}}
				onFocus={() => {
					if (isPickerOpen) {
						setIsPickerOpen(false);
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
				<img
					src={CALENDER_ICON}
					className={styles.calender_icon}
					alt="calendar"
				/>
			</span>

			{isPickerOpen && (
				<>
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 1399,
						}}
						onClick={() => setIsPickerOpen(false)}
					/>
					<div
						style={{
							position: "absolute",
							top: "100%",
							left: 0,
							zIndex: 1400,
							marginTop: "8px",
						}}
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
									onClick={handleSubmit(onSubmitHandler)}
								>
									OK
								</Button>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

export default DateTimePicker;
