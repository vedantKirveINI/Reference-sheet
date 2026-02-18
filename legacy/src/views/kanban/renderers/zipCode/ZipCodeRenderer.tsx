// Zip Code Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParseZipCode } from "@/cell-level/renderers/zipCode/utils/zipCodeUtils";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { getCountryFlag } from "../common/getCountryFlag";

interface ZipCodeRendererProps {
	cell: ICell;
	column: IColumn;
}

export const ZipCodeRenderer: React.FC<ZipCodeRendererProps> = ({ cell }) => {
	const zipValue = cell.data || cell.displayData;
	const { isValid, parsedValue } = validateAndParseZipCode(zipValue);

	if (!isValid && zipValue != null && zipValue !== "") {
		const errorMessage =
			typeof zipValue === "string" ? zipValue : JSON.stringify(zipValue);
		return <ErrorDisplay message={errorMessage} />;
	}

	if (!parsedValue || !parsedValue.zipCode) {
		return null;
	}

	return (
		<div className="flex items-center gap-1.5 text-[13px] text-[#212121]">
			{parsedValue.countryCode && (
				<span className="text-base leading-none">
					{getCountryFlag(parsedValue.countryCode)}
				</span>
			)}
			<span className="font-normal">{parsedValue.zipCode}</span>
		</div>
	);
};
