// Phase 3: Kanban Stack Title Component
// Displays the stack name/value
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/kanban/components/KanbanStackTitle.tsx

import React from "react";
import type { IStackData } from "@/types/kanban";
import styles from "./KanbanStackTitle.module.scss";

interface KanbanStackTitleProps {
	stack: IStackData;
	isUncategorized?: boolean;
}

export const KanbanStackTitle: React.FC<KanbanStackTitleProps> = ({
	stack,
	isUncategorized,
}) => {
	const { data } = stack;

	const displayText = isUncategorized
		? "Uncategorized"
		: data != null
		? String(data)
		: "Untitled";

	return (
		<div className={styles.title}>
			{displayText}
		</div>
	);
};

