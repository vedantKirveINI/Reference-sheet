// Currency Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParseCurrency } from "@/cell-level/renderers/currency/utils/validateAndParseCurrency";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { getCountryFlag } from "../common/getCountryFlag";

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
		<div className="flex items-center gap-1.5 text-[13px] text-[#212121]">
			{parsedValue.countryCode && (
				<span className="text-base leading-none">
					{getCountryFlag(parsedValue.countryCode)}
				</span>
			)}
			<span className="font-normal">{displayText}</span>
		</div>
	);
};
