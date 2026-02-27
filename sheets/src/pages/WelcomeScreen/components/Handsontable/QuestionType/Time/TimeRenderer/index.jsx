import InputMask from "react-input-mask";

import { parseISOValue } from "../../../../../../../utils/dateHelpers";
import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import validateAndParseTime from "../utils/validateAndParseTime";

import styles from "./styles.module.scss";

function TimeRenderer(props) {
	const {
		value = "",
		fieldInfo = {},
		cellProperties = {},
		TD,
		col = "",
		row = "",
		hotTableRef,
	} = props;

	const config = fieldInfo?.options || {};

	const { isTwentyFourHour = false } = config;

	const { isValid = false, parsedValue: newValue = {} } =
		validateAndParseTime(value, isTwentyFourHour);

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	const { time = "", meridiem = "", ISOValue = "" } = newValue || {};

	const {
		hours = "",
		minutes = "",
		meridiem: meridiemFromISO = "",
	} = parseISOValue(ISOValue, false) || {};

	let timeFromISO = "";

	if (hours && minutes) {
		timeFromISO = `${hours}:${minutes}`;
	}

	const actualTime = time || timeFromISO || "";
	const actualMeridiem = meridiem || meridiemFromISO || "";

	if (!isValid) return <ErrorCellRenderer {...props} />;

	return (
		<div className={styles.time_container}>
			<InputMask
				value={actualTime}
				maskChar=""
				readOnly={true}
				mask="99:99"
			/>
			{!isTwentyFourHour && actualMeridiem && actualTime && (
				<div className={styles.meridiem}>{actualMeridiem}</div>
			)}
		</div>
	);
}

export default TimeRenderer;
