// import numbro from "numbro";
import React from "react";

import { NUMBER_PATTERN } from "../../../../../../../constants/regex";
import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";

import styles from "./styles.module.scss";

// const options = {
// 	allowDecimal: true,
// 	decimalPrecision: "0",
// 	commasAfter: "",
// };

// function formatValue(value, options) {
// 	const formattedValue = numbro(Number(value));

// 	let format = {};

// 	if (options.allowDecimal) {
// 		format = {
// 			...format,
// 			mantissa: parseInt(options.decimalPrecision) || 0,
// 		};
// 	}

// 	if (options?.commasAfter) {
// 		format = {
// 			...format,
// 			thousandSeparated: true,
// 		};
// 	}
// 	const formatedNum = formattedValue.format(format);
// 	return formatedNum;
// }

function validateNumber(value) {
	if (!value) {
		return true;
	}

	return NUMBER_PATTERN.test(value);
}

function NumberRenderer(props) {
	const {
		value = "",
		hotTableRef,
		row,
		wrapValue = "",
		cellProperties = {},
		TD,
		col,
	} = props;
	const wrapClass = wrapValue ? styles[wrapValue] : styles.ellipses;

	const isValidNumber = validateNumber(value);

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;
	if (!isValidNumber) return <ErrorCellRenderer {...props} />;

	if (value === null || value === undefined || value === "") {
		return null;
	}

	return (
		<div className={`${styles.number_container} ${wrapClass}`}>
			{isNaN(value) ? "" : value}
		</div>
	);
}

export default NumberRenderer;
