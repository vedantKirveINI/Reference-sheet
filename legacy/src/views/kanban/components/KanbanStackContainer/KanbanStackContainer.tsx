// Phase 3: Kanban Stack Container Component
// Individual column/stack container
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanStackContainer.tsx

import React from "react";
import { Plus } from "lucide-react";
import ODSButton from "oute-ds-button";
import { KanbanStackHeader } from "../KanbanStackHeader/KanbanStackHeader";
import { KanbanStack } from "../KanbanStack/KanbanStack";
import { useKanban } from "../../hooks/useKanban";
import type { IStackData } from "@/types/kanban";
import type { IRecord } from "@/types";
import styles from "./KanbanStackContainer.module.scss";

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
		// Call handler from KanbanProvider to track which stack initiated creation
		handleAddRecordFromStack?.(stack.id);
	};

	return (
		<div className={styles.stackContainer}>
			<KanbanStackHeader stack={stack} />
			<div className={styles.stackContent}>
				<KanbanStack stack={stack} cards={cards} />
			</div>
			{/* Add Record button at bottom of stack */}
			{permission?.canEdit && (
				<div className={styles.addRecordButton}>
					<ODSButton
						variant="black-outlined"
						label="Add Record"
						onClick={handleAddRecord}
						sx={{
							width: "100%",
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
					</ODSButton>
				</div>
			)}
		</div>
	);
};

