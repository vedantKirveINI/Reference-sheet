/**
 * Footer Component for Ranking Dialog
 * Inspired by sheets project's Footer
 */
import React from "react";
import ODSButton from "oute-ds-button";
import styles from "./Footer.module.css";

interface FooterProps {
	handleClose?: () => void;
	handleSave?: () => void;
	disabled?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
	handleClose = () => {},
	handleSave = () => {},
	disabled = false,
}) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="DISCARD"
				onClick={handleClose}
			/>
			<ODSButton
				variant="black"
				label="SAVE"
				onClick={handleSave}
				disabled={disabled}
			/>
		</div>
	);
};
