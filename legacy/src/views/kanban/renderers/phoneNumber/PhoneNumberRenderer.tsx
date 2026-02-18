// Phone Number Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParsePhoneNumber } from "@/cell-level/renderers/phoneNumber/utils/phoneUtils";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { getCountryFlag } from "../common/getCountryFlag";

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
		<div className="flex items-center gap-1.5 text-[13px] text-[#212121]">
			{parsedValue.countryCode && (
				<span className="text-base leading-none">
					{getCountryFlag(parsedValue.countryCode)}
				</span>
			)}
			{parsedValue.countryNumber && (
				<span className="font-medium">+{parsedValue.countryNumber}</span>
			)}
			{parsedValue.phoneNumber && (
				<span className="font-normal">{parsedValue.phoneNumber}</span>
			)}
		</div>
	);
};
