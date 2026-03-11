import React from "react";
import ODSButton from "oute-ds-button";
import styles from "./ExpandedRecordFooter.module.scss";

interface IExpandedRecordFooterProps {
	onCancel: () => void;
	onSave: () => void;
	hasChanges?: boolean;
	isSaving?: boolean;
}

/**
 * ExpandedRecordFooter - Footer with Save and Cancel buttons
 *
 * Matches sheets ExpandedRowFooter design
 */
export const ExpandedRecordFooter: React.FC<IExpandedRecordFooterProps> = ({
	onCancel,
	onSave,
	hasChanges = false,
	isSaving = false,
}) => {
	return (
		<div className={styles.footer}>
			<ODSButton
				variant="black-outlined"
				label="CANCEL"
				onClick={onCancel}
				disabled={isSaving}
				sx={{
					marginRight: "0.5rem",
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
				}}
			/>
			<ODSButton
				variant="black"
				label="SAVE"
				onClick={onSave}
				disabled={isSaving || !hasChanges}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
				}}
			/>
		</div>
	);
};
