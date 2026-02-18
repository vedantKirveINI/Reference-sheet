import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKanban } from "../../hooks/useKanban";

export const KanbanToolBar: React.FC = () => {
	const { setExpandRecordId, permission } = useKanban();

	const handleAddRecord = () => {
		setExpandRecordId?.(undefined);
	};

	return (
		<div className="flex items-center border-t border-[#e0e0e0] px-4 py-2">
			<Button
				variant="outline"
				onClick={handleAddRecord}
				disabled={!permission?.canEdit}
				className="text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center gap-2"
			>
				<Plus className="size-4" />
				Add Record
			</Button>
		</div>
	);
};
