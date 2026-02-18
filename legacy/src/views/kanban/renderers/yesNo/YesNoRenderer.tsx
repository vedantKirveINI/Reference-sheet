// Yes/No Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { YES_NO_COLOUR_MAPPING } from "@/constants/colours";
import styles from "./YesNoRenderer.module.scss";

interface YesNoRendererProps {
	cell: ICell;
	column: IColumn;
}

export const YesNoRenderer: React.FC<YesNoRendererProps> = ({ cell }) => {
	const value = cell.data as string;
	if (!value) return null;

	const bgColor =
		YES_NO_COLOUR_MAPPING[value as keyof typeof YES_NO_COLOUR_MAPPING] ||
		"#CFD8DC";

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
