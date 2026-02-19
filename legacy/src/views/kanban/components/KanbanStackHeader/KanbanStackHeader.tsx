// Phase 3: Kanban Stack Header Component
// Header for each stack/column showing title and count
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanStackHeader.tsx

import React from "react";
import { KanbanStackTitle } from "../KanbanStackTitle/KanbanStackTitle";
import type { IStackData } from "@/types/kanban";
import { UNCATEGORIZED_STACK_ID } from "@/types/kanban";
import styles from "./KanbanStackHeader.module.scss";

interface KanbanStackHeaderProps {
	stack: IStackData;
}

export const KanbanStackHeader: React.FC<KanbanStackHeaderProps> = ({ stack }) => {
	const { id: stackId, count } = stack;
	const isUncategorized = stackId === UNCATEGORIZED_STACK_ID;

	return (
		<div className={styles.header}>
			<KanbanStackTitle stack={stack} isUncategorized={isUncategorized} />
			<span className={styles.count}>{count}</span>
		</div>
	);
};

