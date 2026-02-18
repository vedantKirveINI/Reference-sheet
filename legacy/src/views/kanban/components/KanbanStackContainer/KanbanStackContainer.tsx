import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanStackHeader } from "../KanbanStackHeader/KanbanStackHeader";
import { KanbanStack } from "../KanbanStack/KanbanStack";
import { useKanban } from "../../hooks/useKanban";
import type { IStackData } from "@/types/kanban";
import type { IRecord } from "@/types";

interface KanbanStackContainerProps {
	index: number;
	stack: IStackData;
	cards: IRecord[];
}

export const KanbanStackContainer: React.FC<KanbanStackContainerProps> = ({
	stack,
	cards,
}) => {
	const { handleAddRecordFromStack, permission } = useKanban();

	const handleAddRecord = () => {
		handleAddRecordFromStack?.(stack.id);
	};

	return (
		<div className="w-[280px] h-full border border-black/[.08] rounded-lg bg-[var(--kanban-bg-color)] flex flex-col shrink-0 overflow-hidden">
			<KanbanStackHeader stack={stack} />
			<div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
				<KanbanStack stack={stack} cards={cards} />
			</div>
			{permission?.canEdit && (
				<div className="px-3 py-2 border-t border-[#e0e0e0] bg-[var(--kanban-bg-color)]">
					<Button
						variant="outline"
						onClick={handleAddRecord}
						className="w-full text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2"
					>
						<Plus className="size-4" />
						Add Record
					</Button>
				</div>
			)}
		</div>
	);
};
