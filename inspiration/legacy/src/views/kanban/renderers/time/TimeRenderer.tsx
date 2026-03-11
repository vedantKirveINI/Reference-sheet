// Time Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { validateAndParseTime, formatTimeDisplay } from "@/utils/dateHelpers";
import { ErrorDisplay } from "../common/ErrorDisplay";
import styles from "./TimeRenderer.module.scss";

interface TimeRendererProps {
	cell: ICell;
	column: IColumn;
}

export const TimeRenderer: React.FC<TimeRendererProps> = ({ cell, column }) => {
	const isTwentyFourHour = (cell as any).options?.isTwentyFourHour || 
		column.options?.isTwentyFourHour || false;
	
	const timeValue = cell.data || cell.displayData;
	const validationResult = validateAndParseTime(timeValue, isTwentyFourHour);
	
	if (!validationResult.isValid && timeValue != null && timeValue !== "") {
		const errorMessage = typeof timeValue === "string" 
			? timeValue 
			: JSON.stringify(timeValue);
		return <ErrorDisplay message={errorMessage} />;
	}
	
	if (!validationResult.parsedValue) {
		return null;
	}
	
	const { time, meridiem } = validationResult.parsedValue;
	const displayText = formatTimeDisplay(time, meridiem, isTwentyFourHour);
	
	if (!displayText) return null;
	
	return <div className={styles.timeValue}>{displayText}</div>;
};

