// Phase 3: Kanban Stack Header Component
// Header for each stack/column showing title and count
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanStackHeader.tsx

import React from "react";
import { KanbanStackTitle } from "../KanbanStackTitle/KanbanStackTitle";
import type { IStackData } from "@/types/kanban";
import { UNCATEGORIZED_STACK_ID } from "@/types/kanban";

interface KanbanStackHeaderProps {
	stack: IStackData;
}

export const KanbanStackHeader: React.FC<KanbanStackHeaderProps> = ({ stack }) => {
	const { id: stackId, count } = stack;
	const isUncategorized = stackId === UNCATEGORIZED_STACK_ID;

	return (
		<div className="flex items-center gap-2 py-3 px-4 border-b border-[#e0e0e0] bg-white shrink-0 min-h-[4rem]">
			<KanbanStackTitle stack={stack} isUncategorized={isUncategorized} />
			<span className="text-sm text-[#797373] font-medium py-0.5 px-2 rounded-xl min-w-[1.5rem] text-center">{count}</span>
		</div>
	);
};
