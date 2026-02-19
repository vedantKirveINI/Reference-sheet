// String/LongText/Email Renderer for Kanban Cards (Default)
import React from "react";
import type { ICell, IColumn } from "@/types";
import styles from "./StringRenderer.module.scss";

interface StringRendererProps {
	cell: ICell;
	column: IColumn;
}

export const StringRenderer: React.FC<StringRendererProps> = ({ cell, column }) => {
	const value = cell.displayData || String(cell.data || "");
	if (!value) return null;
	
	return <div className={styles.textValue}>{value}</div>;
};

