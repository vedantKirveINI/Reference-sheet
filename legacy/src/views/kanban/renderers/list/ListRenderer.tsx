// List Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import styles from "./ListRenderer.module.scss";

interface ListRendererProps {
	cell: ICell;
	column: IColumn;
}

export const ListRenderer: React.FC<ListRendererProps> = ({ cell, column }) => {
	const listData = cell.data;
	if (!listData || !Array.isArray(listData)) {
		return null;
	}

	if (listData.length === 0) {
		return null;
	}

	return (
		<div className={styles.listContainer}>
			{listData.map((item: string, index: number) => (
				<div key={index} className={styles.listItem}>
					{item}
				</div>
			))}
		</div>
	);
};
