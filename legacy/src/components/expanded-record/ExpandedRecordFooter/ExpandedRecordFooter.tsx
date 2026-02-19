import React from "react";
import { Button } from "@/components/ui/button";
import styles from "./ExpandedRecordFooter.module.scss";

interface IExpandedRecordFooterProps {
	onCancel: () => void;
	onSave: () => void;
	hasChanges?: boolean;
	isSaving?: boolean;
}

export const ExpandedRecordFooter: React.FC<IExpandedRecordFooterProps> = ({
	onCancel,
	onSave,
	hasChanges = false,
	isSaving = false,
}) => {
	return (
		<div className={styles.footer}>
			<Button
				variant="outline"
				onClick={onCancel}
				disabled={isSaving}
				style={{
					marginRight: "0.5rem",
					fontSize: "0.875rem",
					fontWeight: "500",
					textTransform: "none",
				}}
			>
				CANCEL
			</Button>
			<Button
				onClick={onSave}
				disabled={isSaving || !hasChanges}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					textTransform: "none",
				}}
			>
				SAVE
			</Button>
		</div>
	);
};
