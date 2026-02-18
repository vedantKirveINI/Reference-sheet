import React from "react";
import type { ICell, IColumn } from "@/types";
import { getScqColor } from "@/cell-level/renderers/scq/utils/colorUtils";

interface ScqRendererProps {
	cell: ICell;
	column: IColumn;
}

export const ScqRenderer: React.FC<ScqRendererProps> = ({ cell, column }) => {
	const value = cell.data as string;
	if (!value) return null;
	
	const bgColor = getScqColor(value, column.options || []);
	
	return (
		<div className="flex items-center">
			<div
				className="inline-flex items-center justify-center min-h-[20px] px-2 py-0.5 rounded-2xl text-[13px] font-normal text-[#212121] whitespace-nowrap overflow-hidden text-ellipsis max-w-full"
				style={{ backgroundColor: bgColor }}
			>
				{value}
			</div>
		</div>
	);
};
