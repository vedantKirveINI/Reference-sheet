// Phase 3: Kanban Hook
// Hook to access Kanban context
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/hooks/useKanban.ts

import { useContext } from "react";
import { KanbanContext } from "../context/KanbanContext";

export const useKanban = () => {
	return useContext(KanbanContext);
};

