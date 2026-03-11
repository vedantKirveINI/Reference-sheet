import React from "react";

import { getAssignedColours } from "../../../../../../../utils/assignColours";
import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import useChipWidths from "../hooks/useChipWidths";
import validateSCQ from "../utils/validateSCQ";

import styles from "./styles.module.scss";

const ScqRenderer = (props) => {
	const {
		value = "",
		fieldInfo = {},
		row,
		cellProperties = {},
		hotTableRef,
		TD,
		col,
		wrapValue = "",
	} = props;
	const config = fieldInfo?.options || {};

	const { options = [] } = config;

	const { isValid = false, newValue = "" } = validateSCQ(value, options);

	const { width } = TD.getBoundingClientRect();

	// padding left and right -> 8px and 1px of border
	const availableWidth = +(width - 8 * 2 - 1).toFixed(2);

	const wrapClass = wrapValue ? styles[wrapValue] : styles.ellipses;

	const { borderRadius } = useChipWidths({
		selectionValue: newValue,
		availableWidth,
		wrapValue,
	});

	const optionsWithColours = getAssignedColours(options);

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
		<div className={styles.scq_container}>
			{newValue && (
				<div
					className={`${styles.scq_chip} ${wrapClass}`}
					style={{
						backgroundColor: `${optionsWithColours[newValue]}`,
						borderRadius,
					}}
				>
					{newValue}
				</div>
			)}
		</div>
	);
};

export default ScqRenderer;
