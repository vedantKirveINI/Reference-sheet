import React from "react";
import { AlertCircle } from "lucide-react";
import styles from "./ErrorDisplay.module.scss";

interface ErrorDisplayProps {
	message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
	return (
		<div className={styles.errorContainer}>
			<span className={styles.errorText}>{message}</span>
			<AlertCircle className={styles.errorIcon} style={{ width: "1rem", height: "1rem", color: "#d32f2f" }} />
		</div>
	);
};
