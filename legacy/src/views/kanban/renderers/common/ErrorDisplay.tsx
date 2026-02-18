import React from "react";
import ODSIcon from "oute-ds-icon";
import { ERROR_ICON } from "@/constants/Icons/commonIcons";
import styles from "./ErrorDisplay.module.scss";

interface ErrorDisplayProps {
	message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
	return (
		<div className={styles.errorContainer}>
			<span className={styles.errorText}>{message}</span>
			<ODSIcon
				imageProps={{
					src: ERROR_ICON,
					alt: "Error",
					className: styles.errorIcon,
				}}
			/>
		</div>
	);
};

