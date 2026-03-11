import validateTime from "@/utils/validateTime";

function formatTimeData({ formData }) {
	const { defaultTime, isTwentyFourHour, ...rest } = formData;

	const validatedTime = validateTime({
		timeValue: defaultTime,
		isTwentyFourHour,
	});

	if (defaultTime && !validatedTime) {
		return {
			isError: true,
			data: { msg: "Invalid time input" },
		};
	}

	const newDefaultTime = { ...defaultTime };

	if (isTwentyFourHour) {
		delete newDefaultTime.meridiem;
	}

	const transformedData = {
		...rest,
		isTwentyFourHour,
		defaultTime: newDefaultTime,
	};

	return { isError: false, data: transformedData };
}

export default formatTimeData;
