import ODSIcon from "oute-ds-icon";
import { useMemo } from "react";

import { PLAY_ICON } from "../../../../../../constants/Icons/commonIcons";
import { applyCustomClass } from "../../utils/applyCustomClass";
import LoadingCell from "../LoadingCell";

import styles from "./styles.module.scss";

function EnrichmentRenderer({
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
	} = cellProperties?.cellProperties || {};

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
		return (
			<LoadingCell
				shouldShowText={true}
				loadingText="Enhancing data..."
			/>
		);
	}

	return (
		<div className={`${styles.enrichment_container} ${wrapClass}`}>
			{value}

			<ODSIcon
				imageProps={{
					src: PLAY_ICON,
					"data-testid": `run-icon-row-${row}`,
					"data-enrichment-run-button": `${row}-${fieldId}`,
					className: styles.play_icon,
				}}
			/>
		</div>
	);
}

export default EnrichmentRenderer;
