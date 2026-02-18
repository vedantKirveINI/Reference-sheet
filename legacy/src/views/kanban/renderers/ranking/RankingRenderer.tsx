// Ranking Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { ErrorDisplay } from "../common/ErrorDisplay";

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
		<div className="flex flex-wrap gap-1 items-center">
			{rankingData.map((item: any, index: number) => (
				<div key={index} className="inline-flex items-center justify-center min-h-[20px] px-2 py-0.5 rounded text-[13px] font-normal text-[#212121] bg-[#F5F5F5] whitespace-nowrap overflow-hidden text-ellipsis">
					{item.rank}. {item.label}
				</div>
			))}
		</div>
	);
};
