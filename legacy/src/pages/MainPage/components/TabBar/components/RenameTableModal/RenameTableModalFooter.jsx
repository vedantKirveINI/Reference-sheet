import ODSButton from "oute-ds-button";
import ODSLoadingButton from "oute-ds-loading-button";

import styles from "./styles.module.scss";

function RenameTableModalFooter({
	onCancel = () => {},
	onSave = () => {},
	loading = false,
}) {
	return (
		<div className={styles.dialog_actions}>
			<ODSButton
				variant="black-outlined"
				label="CANCEL"
				onClick={onCancel}
				disabled={loading}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
				}}
			/>
			<ODSLoadingButton
				variant="black"
				label="SAVE"
				onClick={onSave}
				loading={loading}
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
}

export default RenameTableModalFooter;
