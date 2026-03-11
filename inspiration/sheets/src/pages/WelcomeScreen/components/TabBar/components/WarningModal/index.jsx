import Button from "oute-ds-button";
import Dialog from "oute-ds-dialog";
import Icon from "oute-ds-icon";
import LoadingButton from "oute-ds-loading-button";
import React from "react";

import styles from "./styles.module.scss";

const TABLE_SETTINGS = ["deleteTable", "clearData"];

function WarningModal({ open, setOpen, loading, onSubmit }) {
	const onClose = () => {
		setOpen("");
	};

	return (
		<Dialog
			open={TABLE_SETTINGS.includes(open)}
			dialogHeight="auto"
			dialogWidth="35rem"
			showFullscreenIcon={false}
			onClose={onClose}
			dialogTitle={
				<div className={styles.title_container}>
					<Icon
						outeIconName={
							open === "clearData"
								? "OUTECloseIcon"
								: "OUTETrashIcon"
						}
					/>
					<span className={styles.title}>
						{open === "clearData" ? "Clear Data" : "Delete Table"}
					</span>
				</div>
			}
			dialogContent={
				<div>
					<h2 className={styles.header}>
						{open === "clearData"
							? "Are you sure you want to clear this table?"
							: "Are you sure you want to delete this table?"}
					</h2>

					<p className={styles.description}>
						{open === "clearData"
							? "This action will remove all data from the table, but the table will still exist."
							: "This action will permanently delete the table and all of its data."}
					</p>
				</div>
			}
			dialogActions={
				<>
					<Button
						variant="black-outlined"
						label="CANCEL"
						onClick={onClose}
						disabled={loading}
					/>
					<LoadingButton
						label={open === "clearData" ? "CLEAR" : "DELETE"}
						loading={loading}
						variant="black"
						color="error"
						onClick={async () => {
							await onSubmit();
							onClose();
						}}
					/>
				</>
			}
			onKeyDown={(e) => e.stopPropagation()}
		/>
	);
}

export default WarningModal;
