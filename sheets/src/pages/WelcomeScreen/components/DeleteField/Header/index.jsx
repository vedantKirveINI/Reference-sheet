import Icon from "oute-ds-icon";
import React from "react";

import styles from "./styles.module.scss";

const DeleteFieldTitle = ({ title = "", iconName = "" }) => {
	return (
		<div className={styles.title_container}>
			<Icon
				outeIconName={iconName}
				outeIconProps={{
					sx: {
						height: "1.5rem",
						width: "1.5rem",
					},
				}}
			/>
			<div className={styles.title}>{title}</div>
		</div>
	);
};

export default DeleteFieldTitle;
