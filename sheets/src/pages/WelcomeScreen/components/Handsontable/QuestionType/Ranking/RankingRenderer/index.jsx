import isEmpty from "lodash/isEmpty";
import React from "react";

import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import useRankingTiles from "../hooks/useRankingTiles";
import validateAndParseRanking from "../utils/validateAndParseRanking";

import styles from "./styles.module.scss";

function RankingRenderer(props) {
	const {
		value = "",
		hotTableRef,
		row,
		fieldInfo = {},
		cellProperties = {},
		TD,
		col,
		wrapValue = "",
	} = props || {};

	const isWrapped = wrapValue === "wrap";

	const { totalRows = 0 } = cellProperties?.cellProperties;
	const { options = [] } = fieldInfo?.options || {};

	const { isValid = false, parsedValue = [] } = validateAndParseRanking(
		value,
		options,
	);

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	const { width, height } = TD.getBoundingClientRect();

	const { limitValue = 0, visibleRankings = [] } = useRankingTiles({
		rankingValues: parsedValue.map((item) => `${item.rank}. ${item.label}`),
		availableWidth: width - 16, // left and right padding
		availableHeight: height - 8, // top and bottom padding
		isWrapped,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;
	if (!isValid) return <ErrorCellRenderer {...props} />;
	if (isEmpty(parsedValue) || parsedValue.some((item) => !item.rank)) return;

	const isSingleChip = visibleRankings.length === 1;

	const containerStyle = {
		...(isSingleChip ? { maxWidth: `calc(100% - 4px)` } : {}),
	};

	const hiddenTiles = parsedValue.slice(visibleRankings.length);

	return (
		<div data-column-index={col} className={`${styles.rank_container}`}>
			{/* Visible rankings */}
			<div
				className={`${styles.tiles} ${styles[wrapValue]}`}
				style={containerStyle}
			>
				{visibleRankings.map((item, index) => (
					<div
						key={`${item}-${index}`}
						className={styles.rank_item}
						title={item}
					>
						{item}
					</div>
				))}

				{limitValue && !isWrapped && (
					<div
						data-ranking-limit-chip
						className={styles.ellipsis_chip}
					>
						...
					</div>
				)}
			</div>

			{/* Hidden placeholders */}
			<div className={styles.hidden_chips_container}>
				{hiddenTiles.map((item) => (
					<div
						data-hidden-ranking-chip
						key={item.id}
						className={styles.rank_item}
						style={{
							visibility: "hidden",
						}}
						title={item.label}
					>
						{item.rank}. {item.label}
					</div>
				))}
			</div>

			{/* spacer div to give extra space artificially for last chip*/}
			{!isWrapped && <div className={styles.spacer} />}
		</div>
	);
}

export default RankingRenderer;
