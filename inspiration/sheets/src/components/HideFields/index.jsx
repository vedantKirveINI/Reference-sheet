import Icon from "oute-ds-icon";
import React from "react";

import styles from "./styles.module.scss";

const HideFields = () => {
	return (
		<div className={styles.hideFieldsOption}>
			<div className={styles.hideFieldsOptionIcon}>
				<Icon outeIconName="OUTEVisibilityOffIcon" />
			</div>
			<div className={styles.hideFieldsOptionLabel}>Hide Fields</div>
		</div>
	);
};

export default HideFields;
