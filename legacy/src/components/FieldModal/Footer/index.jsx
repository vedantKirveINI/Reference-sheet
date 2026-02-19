import { Button } from "@/components/ui/button";
import React from "react";

import styles from "./styles.module.scss";

const Footer = ({ onSave, onClose, loading }) => {
	return (
		<div className={styles.footer_container}>
			<Button
				disabled={loading}
				variant="outline"
				onClick={onClose}
				style={{
					fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					fontSize: "0.8125rem",
					fontWeight: 500,
					textTransform: "none",
					borderRadius: "0.375rem",
					padding: "0.4375rem 1rem",
					minWidth: "5rem",
					height: "2rem",
					borderColor: "#e5e7eb",
					color: "#374151",
				}}
			>
				DISCARD
			</Button>
			<Button
				disabled={loading}
				onClick={onSave}
				style={{
					fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
					fontSize: "0.8125rem",
					fontWeight: 500,
					textTransform: "none",
					borderRadius: "0.375rem",
					padding: "0.4375rem 1rem",
					minWidth: "5rem",
					height: "2rem",
					backgroundColor: "#1f2937",
					color: "#ffffff",
					boxShadow: "0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1)",
				}}
			>
				{loading ? "..." : "SAVE"}
			</Button>
		</div>
	);
};

export default Footer;
