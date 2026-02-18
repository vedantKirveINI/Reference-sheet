import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useImperativeHandle, useRef, useEffect, useState } from "react";

import getField from "../../common/forms/getField";

import { dateControls, timeControls } from "./config/dateTimeControls";
import { useDateTimePicker } from "./hooks/useDateTimePicker";
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
	const dateTimeInputRef = useRef(null);

	const {
		dateTimeVal,
		formHook,
		setDateTimeVal,
		onSubmitHandler,
		isPickerOpen,
		setIsPickerOpen,
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
			input: dateTimeInputRef.current,
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
				scrollableElement.scrollHeight > scrollableElement.clientHeight ||
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

	const displayValue = dateTimeVal ? dateTimeVal.format(format) : "";

	return (
		<div className="flex items-center relative w-full" ref={dateTimeFieldRef}>
			<input
				ref={dateTimeInputRef}
				type={includeTime ? "datetime-local" : "date"}
				value={dateTimeVal ? dateTimeVal.format(includeTime ? "YYYY-MM-DDTHH:mm" : "YYYY-MM-DD") : ""}
				className={`w-full py-2 px-3.5 rounded-xl text-sm ${hideBorders ? "border-none" : "border-2 border-[#212121]"} outline-none`}
				data-testid="date-time-field-input"
				onChange={(e) => {
					const newVal = e.target.value ? dayjs(e.target.value) : null;
					setDateTimeVal(newVal);
					if (newVal && newVal.isValid()) {
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
			/>
			<Popover open={isPickerOpen} onOpenChange={setIsPickerOpen}>
				<PopoverTrigger asChild>
					<span
						className="absolute right-2.5 cursor-pointer bg-white p-1"
						data-testid="calender-icon"
					>
						<img src={CALENDER_ICON} className="w-5 h-5" alt="calendar" />
					</span>
				</PopoverTrigger>
				<PopoverContent
					className="w-auto rounded-lg border border-[#cfd8dc] bg-white shadow-[0rem_0.5rem_1.25rem_0rem_rgba(122,124,141,0.2)] overflow-visible p-2"
					align="start"
					sideOffset={8}
				>
					<div ref={popperRef} data-testid="date-time-popover">
						{dateControls.map((config) => {
							const { name, type } = config;
							const Element = getField(type);
							return <Element key={name} {...config} control={control} />;
						})}

						{includeTime ? (
							<div className="m-4 border-t border-[#cfd8dc]">
								{timeControls.map((config) => {
									const { name, type, label } = config;
									const Element = getField(type);
									return (
										<div key={name}>
											<p className="text-base font-semibold">{label}</p>
											<Element key={name} {...config} control={control} />
										</div>
									);
								})}
							</div>
						) : null}

						<div className="border-t border-[#cfd8dc] px-6 py-2 flex justify-end">
							<Button variant="default" onClick={handleSubmit(onSubmitHandler)}>
								OK
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
}

export default DateTimePicker;
