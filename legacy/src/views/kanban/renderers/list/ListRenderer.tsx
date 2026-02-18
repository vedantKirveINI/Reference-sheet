// List Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";

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
		<div className="flex flex-col gap-1">
			{listData.map((item: string, index: number) => (
				<div key={index} className="text-[13px] text-[#212121] font-normal">
					{item}
				</div>
			))}
		</div>
	);
};
