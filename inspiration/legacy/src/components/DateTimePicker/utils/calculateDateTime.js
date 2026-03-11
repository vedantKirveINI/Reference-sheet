import dayjs from "dayjs";

const getHoursValue = ({ hours, meridiem }) => {
	if (meridiem === "PM" && hours < 12) {
		return +hours + 12;
	}
	if (meridiem === "AM" && +hours === 12) {
		return 0;
	}
	return hours;
};

const calculateDateTime = (formData) => {
	const defaultDate = new Date();

	const { date = defaultDate, time = {} } = formData || {};

	const {
		hours = defaultDate.getHours() % 12 || 12,
		minutes = defaultDate.getMinutes(),
		meridiem = defaultDate.getHours() >= 12 ? "PM" : "AM",
	} = time || {};

	let updateDateTime = date ? dayjs(date) : dayjs(defaultDate);

	let hr = getHoursValue({ hours, meridiem });

	updateDateTime = updateDateTime.set("hours", hr);
	updateDateTime = updateDateTime.set("minutes", minutes);

	return updateDateTime;
};

export default calculateDateTime;
