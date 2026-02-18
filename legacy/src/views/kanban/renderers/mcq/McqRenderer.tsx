// MCQ (Multi Choice) Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { getChipColor } from "@/cell-level/renderers/mcq/utils/chipUtils";
import styles from "./McqRenderer.module.scss";

interface McqRendererProps {
	cell: ICell;
	column: IColumn;
}

export const McqRenderer: React.FC<McqRendererProps> = ({ cell, column }) => {
	const values = Array.isArray(cell.data) ? cell.data : [];
	if (values.length === 0) return null;
	
	return (
		<div className={styles.chipsContainer}>
			{values.map((value: string, index: number) => {
				const bgColor = getChipColor(index);
				return (
					<div
						key={index}
						className={styles.mcqChip}
						style={{ backgroundColor: bgColor }}
					>
						{value}
					</div>
				);
			})}
		</div>
	);
};

