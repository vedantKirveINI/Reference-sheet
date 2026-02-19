import { Button } from "@/components/ui/button";
import React from "react";

import styles from "./styles.module.scss";

const SortFooter = ({
	onSort = () => {},
	onClose = () => {},
	loading = false,
}) => {
	return (
		<div className={styles.footer_container}>
			<Button
				variant="outline"
				onClick={onClose}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
				}}
			>
				CANCEL
			</Button>
			<Button
				disabled={loading}
				onClick={onSort}
				style={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
					backgroundColor: "#1f2937",
					color: "#ffffff",
				}}
			>
				{loading ? "..." : "SORT"}
			</Button>
		</div>
	);
};

export default SortFooter;
