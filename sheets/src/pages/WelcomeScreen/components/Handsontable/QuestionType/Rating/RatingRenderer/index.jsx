import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import validateRating from "../utils/validateRating";

import styles from "./styles.module.scss";

function RatingRenderer(props) {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
	} = props || {};

	const { totalRows = 0, fieldInfo = {} } = cellProperties?.cellProperties;
	const { maxRating } = fieldInfo?.options || {};

	const { isValid, processedValue } = validateRating({ value, maxRating });

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;

	// Show error renderer for invalid values
	if (!isValid && value !== null && value !== undefined && value !== "") {
		return <ErrorCellRenderer {...props} />;
	}

	return (
		processedValue && (
			<div className={styles.rating_renderer_container}>
				{processedValue}/{maxRating}
			</div>
		)
	);
}

export default RatingRenderer;
