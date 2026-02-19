// Kanban ToolBar Component
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/tool-bar/GridToolBar.tsx

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKanban } from "../../hooks/useKanban";

export const KanbanToolBar: React.FC = () => {
	const { setExpandRecordId, permission } = useKanban();

	const handleAddRecord = () => {
		// Open expanded view in new record mode (user chooses stackField)
		setExpandRecordId?.(undefined);
	};

	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				borderTop: "1px solid #e0e0e0",
				padding: "0.5rem 1rem",
			}}
		>
			<Button
				variant="outline"
				onClick={handleAddRecord}
				disabled={!permission?.canEdit}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.5rem 1rem",
					borderRadius: "0.375rem",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "0.5rem",
				}}
			>
				<Plus className="size-4" />
				Add Record
			</Button>
		</div>
	);
};
