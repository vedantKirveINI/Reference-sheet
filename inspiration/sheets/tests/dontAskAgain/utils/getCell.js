const getCell = async ({ page, row, col }) => {
	return page.locator(
		`.handsontable.ht_master table tr[aria-rowindex="${row}"] td[aria-colindex="${col}"]`,
	);
};

export default getCell;
