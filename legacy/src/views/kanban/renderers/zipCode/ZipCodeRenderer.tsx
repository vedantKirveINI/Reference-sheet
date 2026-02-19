// Zip Code Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParseZipCode } from "@/cell-level/renderers/zipCode/utils/zipCodeUtils";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { getCountryFlag } from "../common/getCountryFlag";
import styles from "./ZipCodeRenderer.module.scss";

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
		<div className={styles.zipCodeContainer}>
			{parsedValue.countryCode && (
				<span className={styles.flagEmoji}>
					{getCountryFlag(parsedValue.countryCode)}
				</span>
			)}
			<span className={styles.zipCode}>{parsedValue.zipCode}</span>
		</div>
	);
};
