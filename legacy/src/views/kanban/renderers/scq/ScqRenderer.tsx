import React from "react";
import type { ICell, IColumn } from "@/types";
import { getScqColor } from "@/cell-level/renderers/scq/utils/colorUtils";
import styles from "./ScqRenderer.module.scss";

interface ScqRendererProps {
	cell: ICell;
	column: IColumn;
}

export const ScqRenderer: React.FC<ScqRendererProps> = ({ cell, column }) => {
	const value = cell.data as string;
	if (!value) return null;
	
	const bgColor = getScqColor(value, column.options || []);
	
	return (
		<div className={styles.chipContainer}>
			<div
				className={styles.scqChip}
				style={{ backgroundColor: bgColor }}
			>
				{value}
			</div>
		</div>
	);
};

