// Ranking Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { ErrorDisplay } from "../common/ErrorDisplay";
import styles from "./RankingRenderer.module.scss";

interface RankingRendererProps {
	cell: ICell;
	column: IColumn;
}

export const RankingRenderer: React.FC<RankingRendererProps> = ({ cell }) => {
	const rankingData = cell.data;
	const displayDataString = String(cell.displayData || "");

	if (
		displayDataString === "[object Object]" ||
		displayDataString === "[object Array]"
	) {
		let errorMessage = "[{}]";
		try {
			if (rankingData && Array.isArray(rankingData)) {
				errorMessage = JSON.stringify(rankingData);
			} else if (rankingData) {
				errorMessage = JSON.stringify(rankingData);
			}
		} catch {
			errorMessage = "[{}]";
		}

		return <ErrorDisplay message={errorMessage} />;
	}

	if (
		!rankingData ||
		!Array.isArray(rankingData) ||
		rankingData.length === 0
	) {
		return null;
	}

	const hasEmptyObjects = rankingData.some(
		(item) =>
			typeof item === "object" &&
			item !== null &&
			Object.keys(item).length === 0,
	);

	if (hasEmptyObjects) {
		const errorMessage = JSON.stringify(rankingData);
		return <ErrorDisplay message={errorMessage} />;
	}

	return (
		<div className={styles.rankingContainer}>
			{rankingData.map((item: any, index: number) => (
				<div key={index} className={styles.rankingChip}>
					{item.rank}. {item.label}
				</div>
			))}
		</div>
	);
};
