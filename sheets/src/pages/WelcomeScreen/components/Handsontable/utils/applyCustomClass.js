export function applyCustomClass({
	TD,
	col,
	row,
	totalRows,
	className,
	hotTableRef,
}) {
	const totalCols = hotTableRef?.current?.hotInstance?.countCols() - 1;

	if (col > 0 && col < totalCols - 1 && row === totalRows) {
		TD.className = className; // Apply custom class only when conditions match
	}
}
