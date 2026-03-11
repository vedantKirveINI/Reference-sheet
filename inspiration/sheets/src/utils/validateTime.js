const time12HourRegex = /^(0[1-9]|1[0-2]):([0-5][0-9])$/;

const time24HourRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

function validateTime({ timeValue, isTwentyFourHour }) {
	const { time } = timeValue || {};

	if (isTwentyFourHour && (time24HourRegex.test(time) || !time)) return true;
	if (!isTwentyFourHour && (time12HourRegex.test(time) || !time)) return true;

	return false;
}

export default validateTime;
