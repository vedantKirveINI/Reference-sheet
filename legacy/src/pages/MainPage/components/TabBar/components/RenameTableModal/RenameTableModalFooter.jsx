import { Button } from "@/components/ui/button";

import styles from "./styles.module.scss";

function RenameTableModalFooter({
	onCancel = () => {},
	onSave = () => {},
	loading = false,
}) {
	return (
		<div className={styles.dialog_actions}>
			<Button
				variant="outline"
				onClick={onCancel}
				disabled={loading}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					textTransform: "none",
				}}
			>
				CANCEL
			</Button>
			<Button
				onClick={onSave}
				disabled={loading}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					textTransform: "none",
				}}
			>
				{loading ? "..." : "SAVE"}
			</Button>
		</div>
	);
}

export default RenameTableModalFooter;
