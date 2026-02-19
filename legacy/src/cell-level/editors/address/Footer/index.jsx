import ODSButton from "oute-ds-button";
import React from "react";

import styles from "./styles.module.scss";

function Footer({ handleAllFieldsClear = () => {}, handleSubmit = () => {} }) {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="CLEAR ALL"
				onClick={handleAllFieldsClear}
			/>
			<ODSButton variant="black" label="SAVE" onClick={handleSubmit} />
		</div>
	);
}

export default Footer;
