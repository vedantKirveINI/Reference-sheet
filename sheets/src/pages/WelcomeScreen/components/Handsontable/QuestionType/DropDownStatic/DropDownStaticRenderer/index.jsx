import isEmpty from "lodash/isEmpty";

import { getChipsColor } from "../../../../../../../utils/assignColours";
import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import useChipWidths from "../hooks/useChipWidths";
import validateAndParseInput from "../utils/validateAndParseInput";

import styles from "./styles.module.scss";

const DropDownStaticRenderer = (props) => {
	const {
		value,
		hotTableRef,
		row,
		fieldInfo = {},
		cellProperties = {},
		TD,
		col,
		wrapValue = "",
	} = props;

	const isWrapped = wrapValue === "wrap";

	const { options = [] } = fieldInfo.options || {};

	const { isValid = false, parsedValue = [] } = validateAndParseInput(
		value,
		options,
	);

	const { totalRows = 0 } = cellProperties?.cellProperties;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	const { width, height } = TD.getBoundingClientRect();

	// padding top and bottom -> 8px
	const availableWidth = +(width - 8 * 2).toFixed(2);

	// padding top and bottom -> 4px
	const availableHeight = +(height - 4 * 2).toFixed(2);

	const { limitValue = 0, visibleChips = [] } = useChipWidths({
		selectionValues: parsedValue,
		availableHeight,
		availableWidth,
		withDeleteIcon: false,
		isWrapped,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;
	if (!isValid) return <ErrorCellRenderer {...props} />;
	if (isEmpty(parsedValue)) return;

	const isSingleChip = visibleChips.length === 1;

	const containerStyle = {
		...(isSingleChip ? { maxWidth: `calc(100% - 4px)` } : {}),
	};

	const hiddenChips = parsedValue.slice(visibleChips.length);

	return (
		<div
			className={`${styles.dropdown_static_container}`}
			data-column-index={col}
		>
			{/* Visible chips */}
			<div
				className={`${styles.visible_chips} ${styles[wrapValue]}`}
				style={containerStyle}
			>
				{visibleChips.map((chipValue, index) => {
					const bgColor = getChipsColor({ index, type: "scq" });

					return (
						<span
							key={`${index}_${chipValue}`}
							className={`${styles.dropdown_static_chip} ${isWrapped ? styles.full_width_chip : ""}`}
							style={{
								backgroundColor: bgColor,
							}}
						>
							{chipValue}
						</span>
					);
				})}

				{/* Show +N overflow */}
				{limitValue && !isWrapped && (
					<span
						className={styles.limit_text}
						data-dropdown-static-limit-chip
					>
						{limitValue}
					</span>
				)}
			</div>

			{/* Hidden chips */}
			<div className={styles.hidden_chips_container}>
				{hiddenChips.map((chipValue, index) => {
					const originalIndex = visibleChips.length + index;
					const bgColor = getChipsColor({
						index: originalIndex,
						type: "scq",
					});
					return (
						<span
							data-hidden-dropdown-static-chip
							key={`hidden_${index}_${chipValue}`}
							className={styles.dropdown_static_chip}
							style={{
								backgroundColor: bgColor,
								visibility: "hidden",
							}}
						>
							{chipValue}
						</span>
					);
				})}
			</div>

			{/* spacer div to give extra space artificially for last chip*/}
			{!isWrapped && <span className={`${styles.spacer}`} />}
		</div>
	);
};

export default DropDownStaticRenderer;
