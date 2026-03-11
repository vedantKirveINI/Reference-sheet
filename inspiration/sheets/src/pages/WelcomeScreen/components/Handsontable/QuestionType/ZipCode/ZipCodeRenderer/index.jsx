import Icon from "oute-ds-icon";
import React from "react";
import InputMask from "react-input-mask";

import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import { getZipCodePattern } from "../constant";
import validateAndParseZipCode from "../utils/validateAndParseZipCode";

import styles from "./styles.module.scss";

const ZipCodeRenderer = (props) => {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
	} = props;

	const { isValid = false, parsedValue: newValue = {} } =
		validateAndParseZipCode(value);

	const { countryCode = "", zipCode = "" } = newValue || {};

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
		<div className={styles.zip_code_container}>
			{countryCode && (
				<img
					className={styles.country_flag}
					src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
					loading="lazy"
					alt="icon"
				/>
			)}

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

			<span className={styles.vertical_line} />

			<InputMask
				mask={getZipCodePattern(countryCode).pattern}
				formatChars={getZipCodePattern(countryCode).formatChars}
				placeholder="123"
				value={zipCode}
				maskChar=""
				readOnly={true}
			/>
		</div>
	);
};

export default ZipCodeRenderer;
