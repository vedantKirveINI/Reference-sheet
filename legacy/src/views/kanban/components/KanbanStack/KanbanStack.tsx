// Phase 3: Kanban Stack Component
// Renders cards for a specific stack
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanStack.tsx

import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { KanbanCard } from "../KanbanCard/KanbanCard";
import type { IStackData } from "@/types/kanban";
import type { IRecord } from "@/types";

interface KanbanStackProps {
	stack: IStackData;
	cards: IRecord[];
}

export const KanbanStack: React.FC<KanbanStackProps> = ({ stack, cards }) => {
	return (
		<Droppable droppableId={stack.id} mode="standard">
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.droppableProps}
					className={cards.length === 0 ? "flex flex-col items-center justify-center min-h-[120px] p-5 gap-3" : "flex flex-col gap-2"}
					style={{
						backgroundColor: snapshot.isDraggingOver
							? "rgba(0, 0, 0, 0.02)"
							: undefined,
					}}
				>
					{cards.length === 0 ? (
						<div className="text-sm text-[#999] font-normal">No records</div>
					) : (
						cards.map((record, index) => (
							<KanbanCard
								key={record.id}
								record={record}
								stack={stack}
								index={index}
							/>
						))
					)}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	);
};
