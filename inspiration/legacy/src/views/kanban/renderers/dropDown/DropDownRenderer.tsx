// DropDown Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { getChipColor } from "@/cell-level/renderers/mcq/utils/chipUtils";
import styles from "./DropDownRenderer.module.scss";

interface DropDownRendererProps {
	cell: ICell;
	column: IColumn;
}

export const DropDownRenderer: React.FC<DropDownRendererProps> = ({ cell }) => {
	const values = Array.isArray(cell.data) ? cell.data : [];
	if (values.length === 0) return null;
	
	return (
		<div className={styles.chipsContainer}>
			{(values as string[]).map((value: string, index: number) => {
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

