// Yes/No Renderer for Kanban Cards
import React from "react";
import type { ICell, IColumn } from "@/types";
import { YES_NO_COLOUR_MAPPING } from "@/constants/colours";

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
