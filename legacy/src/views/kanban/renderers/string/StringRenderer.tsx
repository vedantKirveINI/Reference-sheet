// String/LongText/Email Renderer for Kanban Cards (Default)
import React from "react";
import type { ICell, IColumn } from "@/types";

interface StringRendererProps {
	cell: ICell;
	column: IColumn;
}

export const StringRenderer: React.FC<StringRendererProps> = ({ cell, column }) => {
	const value = cell.displayData || String(cell.data || "");
	if (!value) return null;
	
	return <div className="text-[13px] text-[#212121] font-normal break-words leading-[1.4]">{value}</div>;
};
