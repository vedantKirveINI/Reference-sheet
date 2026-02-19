// Date/DateTime Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import styles from "./DateTimeRenderer.module.scss";

interface DateTimeRendererProps {
	cell: ICell;
	column: IColumn;
}

export const DateTimeRenderer: React.FC<DateTimeRendererProps> = ({ cell }) => {
	const value = cell.displayData || String(cell.data || "");
	if (!value) return null;
	
	return <div className={styles.dateValue}>{value}</div>;
};

