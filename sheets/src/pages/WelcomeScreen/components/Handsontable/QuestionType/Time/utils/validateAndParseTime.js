import validateTime from "../../../../../../../utils/validateTime";

function validateAndParseTime(data, isTwentyFourHour = false) {
	try {
		const parsedValue = JSON.parse(data);

		if (typeof parsedValue === "object" && parsedValue !== null) {
			const { time = "", meridiem = "" } = parsedValue || {};

			if (!time) {
				return { isValid: false, parsedValue: undefined };
			}

			if (!isTwentyFourHour && !meridiem) {
				return { isValid: false, parsedValue: undefined };
			}

			const isValidTime = validateTime({
				timeValue: { time, meridiem },
				isTwentyFourHour,
			});

			return {
				isValid: isValidTime,
				parsedValue: isValidTime ? parsedValue : undefined,
			};
		} else if (parsedValue === null) {
			return { isValid: true, parsedValue };
		}

		return { isValid: false, parsedValue: undefined };
	} catch (err) {
		return { isValid: false, parsedValue: undefined };
	}
}

export default validateAndParseTime;
