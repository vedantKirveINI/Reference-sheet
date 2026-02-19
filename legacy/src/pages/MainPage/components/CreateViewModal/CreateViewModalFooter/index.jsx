import ODSButton from "oute-ds-button";
import ODSLoadingButton from "oute-ds-loading-button";

import styles from "./styles.module.scss";

function CreateViewModalFooter({
	onCancel = () => {},
	onSave = () => {},
	loading = false,
	saveButtonLabel = "CREATE NEW VIEW",
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
					fontWeight: "600",
					padding: "0.625rem 1.25rem",
					borderRadius: "8px",
					textTransform: "none",
					minWidth: "100px",
					borderColor: "#e5e7eb",
					color: "#374151",
					"&:hover": {
						borderColor: "#9ca3af",
						backgroundColor: "#f9fafb",
					},
				}}
			/>
			<ODSLoadingButton
				variant="black"
				label={saveButtonLabel}
				onClick={onSave}
				loading={loading}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "600",
					padding: "0.625rem 1.25rem",
					borderRadius: "8px",
					textTransform: "none",
					minWidth: "140px",
					backgroundColor: "#1a1a1a",
					"&:hover": {
						backgroundColor: "#000000",
						boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
					},
				}}
			/>
		</div>
	);
}

export default CreateViewModalFooter;

