import ODSButton from "oute-ds-button";
import ODSLoadingButton from "oute-ds-loading-button";
import React from "react";

import styles from "./styles.module.scss";

const Footer = ({
	onClose = () => {},
	onFileUpload = () => {},
	loading = false,
}) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="CANCEL"
				onClick={onClose}
			/>
			<ODSLoadingButton
				variant="black"
				label="UPLOAD"
				loading={loading}
				onClick={onFileUpload}
			/>
		</div>
	);
};

export default Footer;
