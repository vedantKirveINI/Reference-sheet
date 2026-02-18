// Number Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";

interface NumberRendererProps {
	cell: ICell;
	column: IColumn;
}

export const NumberRenderer: React.FC<NumberRendererProps> = ({ cell }) => {
	const value = cell.displayData || String(cell.data || "");
	if (!value) return null;
	
	return <div className="text-[13px] text-[#212121] font-normal">{value}</div>;
};
