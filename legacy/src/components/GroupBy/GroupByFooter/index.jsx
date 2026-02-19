import React from "react";
import { Button } from "@/components/ui/button";

import styles from "./styles.module.scss";

function GroupByFooter({
	onGroupBy = () => {},
	onClose = () => {},
	loading = false,
}) {
	return (
		<div className={styles.group_by_footer_container}>
			<Button
				variant="outline"
				size="sm"
				onClick={onClose}
				disabled={loading}
				style={{
					marginRight: "0.5rem",
					textTransform: "none",
					borderColor: "#CFD8DC",
					color: "var(--cell-text-primary-color)",
				}}
			>
				Cancel
			</Button>
			<Button
				size="sm"
				onClick={onGroupBy}
				disabled={loading}
				style={{
					textTransform: "none",
					backgroundColor: "#212121",
					color: "#ffffff",
				}}
			>
				Apply
			</Button>
		</div>
	);
}

export default GroupByFooter;
