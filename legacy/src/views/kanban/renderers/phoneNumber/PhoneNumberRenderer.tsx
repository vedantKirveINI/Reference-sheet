// Phone Number Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParsePhoneNumber } from "@/cell-level/renderers/phoneNumber/utils/phoneUtils";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { getCountryFlag } from "../common/getCountryFlag";
import styles from "./PhoneNumberRenderer.module.scss";

interface PhoneNumberRendererProps {
	cell: ICell;
	column: IColumn;
}

export const PhoneNumberRenderer: React.FC<PhoneNumberRendererProps> = ({ cell }) => {
	const phoneValue = cell.data || cell.displayData;
	const { isValid, parsedValue } = validateAndParsePhoneNumber(phoneValue);
	
	if (!isValid && phoneValue != null && phoneValue !== "") {
		const errorMessage = typeof phoneValue === "string" 
			? phoneValue 
			: JSON.stringify(phoneValue);
		return <ErrorDisplay message={errorMessage} />;
	}
	
	if (!parsedValue || (!parsedValue.phoneNumber && !parsedValue.countryCode && !parsedValue.countryNumber)) {
		return null;
	}
	
	return (
		<div className={styles.phoneContainer}>
			{parsedValue.countryCode && (
				<span className={styles.flagEmoji}>
					{getCountryFlag(parsedValue.countryCode)}
				</span>
			)}
			{parsedValue.countryNumber && (
				<span className={styles.countryCode}>+{parsedValue.countryNumber}</span>
			)}
			{parsedValue.phoneNumber && (
				<span className={styles.phoneNumber}>{parsedValue.phoneNumber}</span>
			)}
		</div>
	);
};

