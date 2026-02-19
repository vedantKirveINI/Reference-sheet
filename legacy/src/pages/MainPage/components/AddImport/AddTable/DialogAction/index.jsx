import ODSButton from "oute-ds-button";
import LoadingButton from "oute-ds-loading-button";
import React from "react";
import styles from "./styles.module.scss";

function DialogActions({
	onDiscard = () => {},
	onAdd = () => {},
	loading = false,
}) {
	return (
		<div className={styles.dialog_actions}>
			<ODSButton
				variant="black-outlined"
				label="DISCARD"
				onClick={onDiscard}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					marginRight: "0.5rem",
				}}
			/>
			<LoadingButton
				variant="black"
				label="ADD"
				onClick={onAdd}
				loading={loading}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
				}}
			/>
		</div>
	);
}

export default DialogActions;
