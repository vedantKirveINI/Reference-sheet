// Confirm Dialog Component - Inspired by Teable
// Phase 2A: Delete Records confirmation dialog
// Uses ODS (OUTE Design System) components

import React from "react";
import ODSDialog from "oute-ds-dialog";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSLoadingButton from "oute-ds-loading-button";
import styles from "./ConfirmDialog.module.scss";

interface IConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	confirmButtonVariant?: "text" | "outlined" | "contained";
	loading?: boolean;
	showIcon?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

/**
 * Confirm Dialog - Reusable confirmation dialog component
 * Used for delete operations and other destructive actions
 * Uses ODS (OUTE Design System) components
 */
export const ConfirmDialog: React.FC<IConfirmDialogProps> = ({
	open,
	title,
	description,
	confirmText = "CONFIRM",
	cancelText = "CANCEL",
	confirmButtonVariant = "contained",
	loading = false,
	showIcon = true,
	onConfirm,
	onCancel,
}) => {
	return (
		<ODSDialog
			open={open}
			onClose={onCancel}
			dialogWidth="32rem"
			hideBackdrop={false}
			showCloseIcon={true}
			showFullscreenIcon={false}
			draggable={false}
			dialogPosition="center"
			dialogTitle={
				<div className={styles.dialog_title}>
					{showIcon && (
						<ODSIcon
							outeIconName="OUTETrashIcon"
							outeIconProps={{
								sx: {
									width: "1.5rem",
									height: "1.5rem",
									color: "#263238",
								},
							}}
						/>
					)}
					<ODSLabel
						variant="h6"
						sx={{ fontFamily: "Inter" }}
						color="#212121"
					>
						{title}
					</ODSLabel>
				</div>
			}
			dialogContent={
				<div className={styles.dialog_content}>
					<ODSLabel
						variant="body1"
						sx={{
							fontFamily: "Inter",
							// fontWeight: "400",
							// fontSize: "0.875rem",
						}}
						// color="#607D8B"
					>
						{description}
					</ODSLabel>
				</div>
			}
			dialogActions={
				<div className={styles.dialog_actions}>
					<ODSButton
						variant="black-outlined"
						color="primary"
						label={cancelText.toUpperCase()}
						onClick={onCancel}
						disabled={loading}
						sx={{
							fontSize: "0.875rem",
							fontWeight: "500",
							padding: "0.4375rem 1rem",
							borderRadius: "0.375rem",
							textTransform: "none",
						}}
						data-testid="confirm-dialog-cancel-button"
					/>
					<ODSLoadingButton
						variant={confirmButtonVariant}
						color={
							confirmButtonVariant === "contained"
								? "error"
								: "primary"
						}
						label={confirmText.toUpperCase()}
						onClick={onConfirm}
						loading={loading}
						sx={{
							fontSize: "0.875rem",
							fontWeight: "500",
							padding: "0.4375rem 1rem",
							borderRadius: "0.375rem",
							textTransform: "none",
						}}
						data-testid="confirm-dialog-confirm-button"
					/>
				</div>
			}
			dividers={true}
			removeContentPadding={false}
		/>
	);
};
