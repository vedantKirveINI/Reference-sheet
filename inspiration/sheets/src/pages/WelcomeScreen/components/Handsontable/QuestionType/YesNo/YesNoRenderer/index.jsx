import React from "react";

import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import validateYesNo from "../utils/validateYesNo";

import styles from "./styles.module.scss";

const getClassName = (value) => {
	switch (value) {
		case "Yes":
			return styles.yes_chip;
		case "No":
			return styles.no_chip;
		default:
			return styles.other_chip;
	}
};

const YesNoRenderer = (props) => {
	const {
		value = "",
		fieldInfo = {},
		cellProperties = {},
		TD,
		col = 0,
		row = 0,
		hotTableRef,
	} = props;

	const { options = {} } = fieldInfo || {};

	const { isValid = false, newValue: chipValue = "" } = validateYesNo({
		value,
		other: options?.other,
	});

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	if (!isValid && value) return <ErrorCellRenderer {...props} />;

	return (
		<div className={styles.yes_no_container} data-testid="yes-no-renderer">
			{chipValue && (
				<div
					className={`${styles.yes_no_chip} ${getClassName(
						chipValue,
					)}`}
				>
					<span>{chipValue}</span>
				</div>
			)}
		</div>
	);
};

export default YesNoRenderer;
