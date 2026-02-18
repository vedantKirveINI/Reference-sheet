// MCQ (Multi Choice) Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { getChipColor } from "@/cell-level/renderers/mcq/utils/chipUtils";

interface McqRendererProps {
	cell: ICell;
	column: IColumn;
}

export const McqRenderer: React.FC<McqRendererProps> = ({ cell, column }) => {
	const values = Array.isArray(cell.data) ? cell.data : [];
	if (values.length === 0) return null;
	
	return (
		<div className="flex flex-wrap gap-1 items-center">
			{values.map((value: string, index: number) => {
				const bgColor = getChipColor(index);
				return (
					<div
						key={index}
						className="inline-flex items-center justify-center min-h-[20px] px-2 py-0.5 rounded text-[13px] font-normal text-[#212121] whitespace-nowrap overflow-hidden text-ellipsis"
						style={{ backgroundColor: bgColor }}
					>
						{value}
					</div>
				);
			})}
		</div>
	);
};
