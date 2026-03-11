import ODSButton from "oute-ds-button";
import LoadingButton from "oute-ds-loading-button";
import React from "react";

import styles from "./styles.module.scss";

const Footer = ({ onSave, onClose, loading }) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				disabled={loading}
				variant="black-outlined"
				label="DISCARD"
				onClick={onClose}
				sx={{
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
					"&:hover": {
						backgroundColor: "#f9fafb",
						borderColor: "#d1d5db",
					},
				}}
			/>
			<LoadingButton
				loading={loading}
				variant="black"
				label="SAVE"
				onClick={onSave}
				sx={{
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
					"&:hover": {
						backgroundColor: "#111827",
						boxShadow: "0 0.125rem 0.375rem rgba(0, 0, 0, 0.15)",
					},
				}}
			/>
		</div>
	);
};

export default Footer;
