// Phase 3: Kanban Stack Title Component
// Displays the stack name/value
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanStackTitle.tsx

import React from "react";
import type { IStackData } from "@/types/kanban";

interface KanbanStackTitleProps {
	stack: IStackData;
	isUncategorized?: boolean;
}

export const KanbanStackTitle: React.FC<KanbanStackTitleProps> = ({
	stack,
	isUncategorized,
}) => {
	const { data } = stack;

	const displayText = isUncategorized
		? "Uncategorized"
		: data != null
		? String(data)
		: "Untitled";

	return (
		<div className="text-sm font-semibold text-[#212121] leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
			{displayText}
		</div>
	);
};
