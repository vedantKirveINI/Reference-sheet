import Icon from "oute-ds-icon";
import React from "react";
import InputMask from "react-input-mask";

import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import validateAndParseCurrency from "../utils/validateAndParseCurrency";

import styles from "./styles.module.scss";

const CurrencyRenderer = (props) => {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
	} = props;

	const { isValid = false, parsedValue: newValue = {} } =
		validateAndParseCurrency(value);

	const {
		currencyCode = "",
		currencySymbol = "",
		currencyValue = "",
		countryCode = "",
	} = newValue || {};

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
	if (!isValid) return <ErrorCellRenderer {...props} />;

	if (!newValue) return null;

	return (
		<div className={styles.currency_container}>
			{countryCode && (
				<img
					className={styles.country_flag}
					src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
					loading="lazy"
					alt="flag"
					data-testid="flag-img"
				/>
			)}

			<span>{currencyCode}</span>
			<span>{currencySymbol}</span>

			<Icon
				outeIconName="OUTEExpandMoreIcon"
				outeIconProps={{
					sx: {
						width: "0.9375rem",
						height: "0.9375rem",
						color: "#000",
					},
				}}
			/>

			<div className={styles.vertical_line} />

			<InputMask
				placeholder="299"
				value={currencyValue}
				maskChar=""
				readOnly={true}
			/>
		</div>
	);
};

export default CurrencyRenderer;
