import { countries } from "@oute/oute-ds.core.constants";
import Icon from "oute-ds-icon";
import React from "react";
import InputMask from "react-input-mask";

import { applyCustomClass } from "../../../utils/applyCustomClass";
import ErrorCellRenderer from "../../ErrorCell/ErrorCellRenderer";
import validateAndParsePhoneNumber from "../utils/validateAndParsePhoneNumber";

import styles from "./styles.module.scss";

const PhoneNumberRenderer = (props) => {
	const {
		value = "",
		hotTableRef,
		row,
		cellProperties = {},
		TD,
		col,
	} = props;

	const { isValid = false, parsedValue = {} } =
		validateAndParsePhoneNumber(value);

	const {
		countryCode = "",
		phoneNumber = "",
		countryNumber = "",
	} = parsedValue || {};

	const country = countries[countryCode];

	const { pattern = "" } = country || {};

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

	if (!parsedValue) return null;

	return (
		<div className={styles.phone_number_container}>
			{countryCode && (
				<img
					className={styles.country_flag}
					src={`https://flagcdn.com/256x192/${countryCode.toLowerCase()}.png`}
					loading="lazy"
					alt="flag"
				/>
			)}
			{countryNumber && <span>+{countryNumber}</span>}
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
				{...(pattern && { mask: pattern })}
				placeholder={pattern || "299"}
				value={phoneNumber}
				maskChar={null}
				readOnly={true}
			/>
		</div>
	);
};

export default PhoneNumberRenderer;
