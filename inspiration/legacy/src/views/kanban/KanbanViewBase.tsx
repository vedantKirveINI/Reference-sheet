// Phase 3: Kanban View Base Component
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/KanbanViewBase.tsx

import React from "react";
import { useKanban } from "./hooks/useKanban";
import { KanbanContainer } from "./components/KanbanContainer/KanbanContainer";

export const KanbanViewBase: React.FC = () => {
	const { stackCollection } = useKanban();

	if (stackCollection == null || stackCollection.length === 0) {
		return (
			<div style={{ 
				padding: "20px", 
				textAlign: "center",
				color: "#666"
			}}>
				No stacks available. Please configure a stack field.
			</div>
		);
	}

	return (
		<div style={{
			width: "100%",
			height: "100%",
			overflow: "hidden",
		}}>
			<KanbanContainer />
		</div>
	);
};

