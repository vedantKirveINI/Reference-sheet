import { useState, useCallback, useRef, useEffect } from "react";

import {
	getISOValue,
	parseISOValue,
} from "../../../../../../../../utils/dateHelpers";
import validateTime from "../../../../../../../../utils/validateTime";
import validateAndParseTime from "../../../../QuestionType/Time/utils/validateAndParseTime";

//to get timezone
const date = new Date();
const options = {
	timeZoneName: "short",
};
const timeWithZone = date.toLocaleString("en-US", options);
const timeZone = timeWithZone?.split(" ").pop();

function useTimeFieldHandler({
	value = "",
	onChange = () => {},
	field = {},
	fieldIndex = 0,
}) {
	const { options = {} } = field || {};
	const { isTwentyFourHour = false } = options;

	const { parsedValue } = validateAndParseTime(value, isTwentyFourHour);

	const [timeValue, setTimeValue] = useState({
		time: parsedValue?.time || "",
		meridiem: parsedValue?.meridiem,
	});
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const inputRef = useRef(null);
	const triggerRef = useRef(null);

	const handleTimeChange = useCallback(
		(e) => {
			const newTime = e.target.value;
			const updatedTime = {
				...timeValue,
				time: newTime,
			};

			setTimeValue(updatedTime);

			const ISOValue = getISOValue(newTime, timeValue.meridiem);

			if (validateTime({ timeValue: updatedTime, isTwentyFourHour })) {
				let meridiem = timeValue.meridiem;

				if (!newTime) {
					meridiem = "";
				}

				if (newTime && !meridiem) {
					const { meridiem: meridiemFromISO } =
						parseISOValue(ISOValue);
					meridiem = meridiemFromISO;
				}

				if (
					(newTime && meridiem) ||
					(timeValue?.time && timeValue?.meridiem)
				) {
					const val = JSON.stringify({
						...updatedTime,
						ISOValue,
						meridiem,
						timeZone,
					});
					onChange(val);
				}
			}
		},
		[onChange, timeValue, isTwentyFourHour],
	);

	const handleMeridiemChange = useCallback(
		(meridiem) => {
			const updatedTime = {
				...timeValue,
				meridiem,
			};

			setTimeValue(updatedTime);
			const ISOValue = getISOValue(timeValue.time, meridiem);

			if (validateTime({ timeValue: updatedTime, isTwentyFourHour })) {
				let finalMeridiem = meridiem;

				if (!timeValue.time) {
					finalMeridiem = "";
				}

				if (timeValue.time && !finalMeridiem) {
					const { meridiem: meridiemFromISO } =
						parseISOValue(ISOValue);
					finalMeridiem = meridiemFromISO;
				}

				if (
					(timeValue.time && finalMeridiem) ||
					(timeValue?.time && timeValue?.meridiem)
				) {
					const val = JSON.stringify({
						...updatedTime,
						ISOValue,
						meridiem: finalMeridiem,
						timeZone,
					});
					onChange(val);
				}
			}
			setIsDropdownOpen(false);
		},
		[onChange, timeValue, isTwentyFourHour],
	);

	const toggleDropdown = useCallback(() => {
		setIsDropdownOpen((prev) => !prev);
	}, []);

	useEffect(() => {
		if (inputRef.current && !isDropdownOpen && fieldIndex === 0) {
			inputRef.current.focus();
		}
	}, [isDropdownOpen]);

	return {
		timeValue,
		isDropdownOpen,
		inputRef,
		triggerRef,
		isTwentyFourHour,
		handleTimeChange,
		handleMeridiemChange,
		toggleDropdown,
		setIsDropdownOpen,
	};
}

export default useTimeFieldHandler;
