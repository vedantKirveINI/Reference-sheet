import ODSButton from "oute-ds-button";
import React from "react";

import styles from "../styles.module.scss";

const Footer = ({ onClose = () => {}, onAddFiles = () => {} }) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="CLOSE"
				onClick={onClose}
			/>
			<ODSButton variant="black" label="ADD MORE" onClick={onAddFiles} />
		</div>
	);
};

export default Footer;
