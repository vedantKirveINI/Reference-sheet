// Currency Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParseCurrency } from "@/cell-level/renderers/currency/utils/validateAndParseCurrency";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { getCountryFlag } from "../common/getCountryFlag";
import styles from "./CurrencyRenderer.module.scss";

interface CurrencyRendererProps {
	cell: ICell;
	column: IColumn;
}

export const CurrencyRenderer: React.FC<CurrencyRendererProps> = ({ cell }) => {
	const currencyValue = cell.data || cell.displayData;
	const { isValid, parsedValue } = validateAndParseCurrency(currencyValue);
	
	if (!isValid && currencyValue != null && currencyValue !== "") {
		const errorMessage = typeof currencyValue === "string" 
			? currencyValue 
			: JSON.stringify(currencyValue);
		return <ErrorDisplay message={errorMessage} />;
	}
	
	if (!parsedValue || (!parsedValue.currencyCode && !parsedValue.currencySymbol && !parsedValue.currencyValue)) {
		return null;
	}
	
	const displayText = parsedValue.currencyValue || 
		`${parsedValue.currencyCode || ""} ${parsedValue.currencySymbol || ""}`.trim();
	
	return (
		<div className={styles.currencyContainer}>
			{parsedValue.countryCode && (
				<span className={styles.flagEmoji}>
					{getCountryFlag(parsedValue.countryCode)}
				</span>
			)}
			<span className={styles.currencyValue}>{displayText}</span>
		</div>
	);
};

