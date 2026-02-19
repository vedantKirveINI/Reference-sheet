import ODSButton from "oute-ds-button";
import ODSLoadingButton from "oute-ds-loading-button";
import React from "react";

import styles from "./styles.module.scss";

const Footer = ({ onClose = () => {}, onSave = () => {}, loading = false }) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="DISCARD"
				onClick={onClose}
				disabled={loading}
			/>
			<ODSLoadingButton
				variant="black"
				label="SAVE"
				onClick={onSave}
				loading={loading}
			/>
		</div>
	);
};

export default Footer;
