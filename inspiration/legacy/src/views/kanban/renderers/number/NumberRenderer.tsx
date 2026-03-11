// Number Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import styles from "./NumberRenderer.module.scss";

interface NumberRendererProps {
	cell: ICell;
	column: IColumn;
}

export const NumberRenderer: React.FC<NumberRendererProps> = ({ cell }) => {
	const value = cell.displayData || String(cell.data || "");
	if (!value) return null;
	
	return <div className={styles.numberValue}>{value}</div>;
};

