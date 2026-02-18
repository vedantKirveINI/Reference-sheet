// Phase 3: Kanban View Base Component
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/KanbanViewBase.tsx

import React from "react";
import { useKanban } from "./hooks/useKanban";
import { KanbanContainer } from "./components/KanbanContainer/KanbanContainer";

export const KanbanViewBase: React.FC = () => {
	const { stackCollection } = useKanban();

	if (stackCollection == null || stackCollection.length === 0) {
		return (
			<div className="p-5 text-center text-[#666]">
				No stacks available. Please configure a stack field.
			</div>
		);
	}

	return (
		<div className="w-full h-full overflow-hidden">
			<KanbanContainer />
		</div>
	);
};
