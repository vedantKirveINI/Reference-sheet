import DateCalendarController from "./Controller/DateCalenderController";
import DateController from "./Controller/DateController";
import DateTimeController from "./Controller/DateTimeController";
import FieldArrayController from "./Controller/FieldArrayController";
import InputController from "./Controller/InputController";
import RadioController from "./Controller/RadioController";
import SelectController from "./Controller/SelectController";
import SwitchController from "./Controller/SwitchController";
import TimeController from "./Controller/TimeController";
import TimePickerController from "./Controller/TimePickerController";

const MAPPING = {
	text: InputController,
	select: SelectController,
	radio: RadioController,
	switch: SwitchController,
	time: TimeController,
	fieldArray: FieldArrayController,
	date: DateController,
	dateCalender: DateCalendarController,
	timePicker: TimePickerController,
	dateTime: DateTimeController,
};

const getField = (type) => {
	const element = MAPPING[type];

	if (!element) {
		return null;
	}

	return element;
};

export default getField;
