// Freeze Column Warning Modal - Inspired by Airtable
// Shows when window is too narrow to display all frozen columns
import React from "react";
import ODSDialog from "oute-ds-dialog";
import ODSButton from "oute-ds-button";
import ODSLabel from "oute-ds-label";
import styles from "./FreezeColumnWarningModal.module.scss";

interface FreezeColumnWarningModalProps {
	open: boolean;
	requestedCount: number;
	actualCount: number;
	onReset: () => void;
	onCancel: () => void;
}

/**
 * Modal that warns user when frozen columns are automatically reduced
 * due to insufficient window width
 */
export const FreezeColumnWarningModal: React.FC<
	FreezeColumnWarningModalProps
> = ({ open, requestedCount, actualCount, onReset, onCancel }) => {
	if (!open) return null;

	return (
		<ODSDialog
			open={open}
			onClose={onCancel}
			dialogWidth="40rem"
			hideBackdrop={false}
			showCloseIcon={true}
			showFullscreenIcon={false}
			draggable={false}
			dialogPosition="center"
			dialogTitle={
				<ODSLabel
					variant="h6"
					sx={{ fontFamily: "Inter", padding: "0rem 1rem" }}
					color="#212121"
				>
					Window is too narrow to adjust frozen columns
				</ODSLabel>
			}
			dialogContent={
				<div className={styles.dialog_content}>
					<ODSLabel
						variant="body1"
						sx={{
							fontFamily: "Inter",
							padding: "1rem",
						}}
						color="#263238"
					>
						You have {requestedCount} frozen column
						{requestedCount !== 1 ? "s" : ""} but only {actualCount}{" "}
						{actualCount === 1 ? "is" : "are"} appearing frozen
						right now because your window is too narrow. You can
						reset the number of frozen columns to {actualCount} to
						fix this. You can also change the number of frozen
						columns by enlarging your window or by making individual
						column widths narrower.
					</ODSLabel>
				</div>
			}
			dialogActions={
				<div className={styles.dialog_actions}>
					<ODSButton
						variant="black-outlined"
						label="Cancel"
						onClick={onCancel}
						sx={{
							fontSize: "0.875rem",
							fontWeight: "500",
							padding: "0.4375rem 1rem",
							borderRadius: "0.375rem",
							textTransform: "none",
						}}
					/>
					<ODSButton
						variant="black"
						label={`Reset to ${actualCount} frozen column${
							actualCount !== 1 ? "s" : ""
						}`}
						onClick={onReset}
						sx={{
							fontSize: "0.875rem",
							fontWeight: "500",
							padding: "0.4375rem 1rem",
							borderRadius: "0.375rem",
						}}
					/>
				</div>
			}
			dividers={true}
			removeContentPadding={false}
		/>
	);
};
