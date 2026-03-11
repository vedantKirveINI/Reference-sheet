import { EMAIL_REGEX } from "../../../../../../../constants/regex";
import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";

import styles from "./styles.module.scss";

function validateEmail(email) {
	return EMAIL_REGEX.test(email);
}

const EmailRenderer = (props) => {
	const {
		value = "",
		hotTableRef,
		row,
		col,
		TD,
		cellProperties = {},
		wrapValue = "",
	} = props;

	const { totalRows = 0 } = cellProperties?.cellProperties;

	const wrapClass = wrapValue ? styles[wrapValue] : styles.ellipses;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	const isValidEmail = validateEmail(value);

	let newValue = value;

	if (!newValue) newValue = null;

	// Don't apply styling to the last row
	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;

	// Apply custom class for invalid emails
	if (!isValidEmail && newValue !== null) {
		return <ErrorCellRenderer {...props} />;
	}

	return (
		<div className={`${styles.email_container} ${wrapClass}`}>{value}</div>
	);
};

export default EmailRenderer;
