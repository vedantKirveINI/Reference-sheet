import ODSButton from "oute-ds-button";
import ODSDialog from "oute-ds-dialog";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSLoadingButton from "oute-ds-loading-button";

import styles from "./styles.module.scss";

function WarningModal({ open, setOpen, loading, onSubmit }) {
	if (!open) return null;

	const isDeleteAction = open === "deleteTable";
	const isClearAction = open === "clearData";

	const title = isDeleteAction
		? "Delete table"
		: isClearAction
			? "Clear data"
			: "Confirm action";

	const question = isDeleteAction
		? "Are you sure you want to delete this table?"
		: isClearAction
			? "Are you sure you want to clear all data from this table?"
			: "Are you sure you want to proceed with this action?";

	const description = isDeleteAction
		? "This action will permanently delete the table and all of its data."
		: isClearAction
			? "This action cannot be undone and all records will be permanently deleted."
			: "This action cannot be undone.";

	const confirmLabel = isDeleteAction
		? "DELETE"
		: isClearAction
			? "CLEAR"
			: "CONFIRM";

	const handleConfirm = () => {
		onSubmit();
	};

	const handleClose = () => {
		if (!loading) {
			setOpen("");
		}
	};

	return (
		<ODSDialog
			open={!!open}
			onClose={handleClose}
			dialogWidth="32rem"
			hideBackdrop={false}
			showCloseIcon={true}
			showFullscreenIcon={false}
			draggable={false}
			dialogPosition="center"
			dialogTitle={
				<div className={styles.dialog_title}>
					{isDeleteAction ? (
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
					) : (
						<ODSIcon
							outeIconName="OUTECloseIcon"
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
						variant="h6"
						sx={{
							fontFamily: "Inter",
							fontWeight: "600",
							marginBottom: "0.5rem",
						}}
						color="#212121"
					>
						{question}
					</ODSLabel>
					<ODSLabel
						variant="body2"
						sx={{
							fontFamily: "Inter",
							fontWeight: "400",
							fontSize: "0.875rem",
						}}
						color="#607D8B"
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
						label="CANCEL"
						onClick={handleClose}
						disabled={loading}
						sx={{
							fontSize: "0.875rem",
							fontWeight: "600",
							padding: "0.625rem 1.25rem",
							borderRadius: "0.375rem",
							textTransform: "none",
						}}
					/>
					<ODSLoadingButton
						variant="contained"
						color={
							isDeleteAction || isClearAction
								? "error"
								: "primary"
						}
						label={confirmLabel}
						onClick={handleConfirm}
						loading={loading}
						sx={{
							fontSize: "0.875rem",
							fontWeight: "600",
							padding: "0.625rem 1.25rem",
							borderRadius: "0.375rem",
							textTransform: "none",
						}}
					/>
				</div>
			}
			dividers={true}
			removeContentPadding={false}
		/>
	);
}

export default WarningModal;
