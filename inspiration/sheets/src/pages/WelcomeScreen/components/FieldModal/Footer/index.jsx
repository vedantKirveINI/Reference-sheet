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
					fontFamily: "Inter",
					fontSize: "0.875rem",
				}}
			/>
			<LoadingButton
				loading={loading}
				variant="black"
				label="SAVE"
				onClick={onSave}
				sx={{
					fontFamily: "Inter",
					fontSize: "0.875rem",
				}}
			/>
		</div>
	);
};

export default Footer;
