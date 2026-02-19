import { Button } from "@/components/ui/button";

import styles from "./styles.module.scss";

function CreateViewModalFooter({
	onCancel = () => {},
	onSave = () => {},
	loading = false,
	saveButtonLabel = "CREATE NEW VIEW",
}) {
	return (
		<div className={styles.dialog_actions}>
			<Button
				variant="outline"
				onClick={onCancel}
				disabled={loading}
				style={{
					fontSize: "0.875rem",
					fontWeight: "600",
					borderRadius: "8px",
					textTransform: "none",
					minWidth: "100px",
					borderColor: "#e5e7eb",
					color: "#374151",
				}}
			>
				CANCEL
			</Button>
			<Button
				onClick={onSave}
				disabled={loading}
				style={{
					fontSize: "0.875rem",
					fontWeight: "600",
					borderRadius: "8px",
					textTransform: "none",
					minWidth: "140px",
					backgroundColor: "#1a1a1a",
					color: "#fff",
				}}
			>
				{loading ? "..." : saveButtonLabel}
			</Button>
		</div>
	);
}

export default CreateViewModalFooter;
