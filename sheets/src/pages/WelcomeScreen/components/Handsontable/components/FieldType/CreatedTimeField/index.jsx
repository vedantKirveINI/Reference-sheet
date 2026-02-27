import ODSTextField from "oute-ds-text-field";

import formatDate from "../../../QuestionType/DateTimePicker/utils/formatDate";

function CreatedTimeField({ value = "", field = {}, fieldIndex }) {
	const {
		dateFormat = "DDMMYYYY",
		separator = "/",
		includeTime = false,
		isTwentyFourHourFormat = false,
	} = field?.options || {};

	const formattedDate = formatDate(
		value,
		dateFormat,
		separator,
		includeTime,
		isTwentyFourHourFormat,
	);

	return (
		<ODSTextField
			className="black"
			value={formattedDate || ""}
			data-testid="created-time-expanded-row"
			readOnly={true}
			fullWidth
			autoFocus={fieldIndex === 0}
		/>
	);
}

export default CreatedTimeField;
