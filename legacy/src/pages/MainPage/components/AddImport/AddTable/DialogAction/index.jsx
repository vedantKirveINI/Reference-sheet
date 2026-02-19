import { Button } from "@/components/ui/button";
import React from "react";
import styles from "./styles.module.scss";

function DialogActions({
	onDiscard = () => {},
	onAdd = () => {},
	loading = false,
}) {
	return (
		<div className={styles.dialog_actions}>
			<Button
				variant="outline"
				onClick={onDiscard}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					marginRight: "0.5rem",
				}}
			>
				DISCARD
			</Button>
			<Button
				onClick={onAdd}
				disabled={loading}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
				}}
			>
				{loading ? "..." : "ADD"}
			</Button>
		</div>
	);
}

export default DialogActions;
