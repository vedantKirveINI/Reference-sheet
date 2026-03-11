import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import getAddress from "../utils/getAddress";
import validateAndParsedAddress from "../utils/validateAndParseAddress";

import styles from "./styles.module.scss";

const AddressRenderer = (props) => {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
		wrapValue = "",
	} = props;

	const { isValid = false, parsedValue = {} } =
		validateAndParsedAddress(value);

	const { totalRows = 0 } = cellProperties?.cellProperties;

	const wrapClass = wrapValue ? styles[wrapValue] : styles.ellipses;

	applyCustomClass({
		TD,
		col,
		row,
		totalRows: totalRows,
		className: "col_border",
		hotTableRef: hotTableRef,
	});

	if (row === hotTableRef.current?.hotInstance?.countRows() - 1) return;
	if (!isValid) return <ErrorCellRenderer {...props} />;

	return (
		<div className={`${styles.address_container} ${wrapClass}`}>
			{getAddress(parsedValue)}
		</div>
	);
};

export default AddressRenderer;
