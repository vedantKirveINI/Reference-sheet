import { applyCustomClass } from "../../../utils/applyCustomClass";
import formatDate from "../../DateTimePicker/utils/formatDate";

import styles from "./styles.module.scss";

function CreatedTimeRenderer(props) {
	const {
		value = "",
		fieldInfo = {},
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
	} = props;

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	const {
		dateFormat = "DDMMYYYY",
		separator = "/",
		includeTime = false,
		isTwentyFourHourFormat = false,
	} = fieldInfo?.options || {};

	if (!value) return;

	const formattedDate = formatDate(
		value,
		dateFormat,
		separator,
		includeTime,
		isTwentyFourHourFormat,
	);

	return <div className={styles.label}>{formattedDate}</div>;
}

export default CreatedTimeRenderer;
