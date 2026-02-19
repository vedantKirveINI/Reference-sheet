import React, { useState } from "react";
import { Layers, ChevronDown } from "lucide-react";
import UpdateKanbanViewModal from "@/pages/MainPage/components/UpdateViewModal";
import type { IColumn } from "@/types";
import styles from "./styles.module.scss";

interface IKanbanViewOptions {
	stackFieldId?: string | number | null;
	isEmptyStackHidden?: boolean;
}

interface StackedByButtonProps {
	stackFieldName?: string;
	columns?: IColumn[];
	viewOptions?: IKanbanViewOptions | null;
	viewId: string;
	onSuccess?: (updatedView: any) => void;
	loading?: boolean;
}

export const StackedByButton: React.FC<StackedByButtonProps> = ({
	stackFieldName = "Select",
	columns = [],
	viewOptions,
	viewId,
	onSuccess,
	loading = false,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const displayText = stackFieldName;

	const handleModalClose = () => {
		setIsModalOpen(false);
	};

	const handleSuccess = (updatedView: any) => {
		if (onSuccess) {
			onSuccess(updatedView);
		}
	};

	return (
		<>
			<div
				className={styles.kanbanControlButton}
				onClick={() => setIsModalOpen(true)}
			>
				<Layers
					style={{
						width: "1rem",
						height: "1rem",
						color: "#263238",
					}}
				/>
				<span className={styles.kanbanControlLabel}>
					Stacked by {displayText}
				</span>
				<ChevronDown
					style={{
						width: "0.75rem",
						height: "0.75rem",
						color: "#666",
					}}
				/>
			</div>

			<UpdateKanbanViewModal
				open={isModalOpen}
				onClose={handleModalClose}
				columns={columns}
				viewOptions={viewOptions}
				viewId={viewId}
				onSuccess={handleSuccess}
			/>
		</>
	);
};
