import { useMemo } from "react";

import { applyCustomClass } from "../../../utils/applyCustomClass";
import LoadingCell from "../../LoadingCell";

import styles from "./styles.module.scss";

function ShortTextRenderer({
	value = "",
	wrapValue = "",
	hotTableRef,
	row,
	cellProperties = {},
	TD,
	col,
	cellLoading,
}) {
	const wrapClass = wrapValue ? styles[wrapValue] : styles.ellipses;
	const {
		totalRows = 0,
		fieldInfo = {},
		records = [],
	} = cellProperties?.cellProperties;

	const { id: fieldId } = fieldInfo || {};

	const rowId = useMemo(() => records?.[row]?.__id, [records, row]);
	const isCellLoading = cellLoading?.[rowId]?.[fieldId];

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;

	if (isCellLoading) {
		return <LoadingCell />;
	}

	return (
		<div className={`${styles.short_text_container} ${wrapClass}`}>
			{value}
		</div>
	);
}

export default ShortTextRenderer;
