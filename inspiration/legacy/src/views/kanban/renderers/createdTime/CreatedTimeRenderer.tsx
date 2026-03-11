// Created Time Renderer for Kanban Cards (read-only)
// Uses displayData (already formatted by formatCell) for consistency with grid/sheets
import React from "react";
import type { ICell, IColumn } from "@/types";
import styles from "../dateTime/DateTimeRenderer.module.scss";

interface CreatedTimeRendererProps {
	cell: ICell;
	column: IColumn;
}

export const CreatedTimeRenderer: React.FC<CreatedTimeRendererProps> = ({
	cell,
}) => {
	const value = cell.displayData || String(cell.data || "");
	if (!value) return null;

	return <div className={styles.dateValue}>{value}</div>;
};
