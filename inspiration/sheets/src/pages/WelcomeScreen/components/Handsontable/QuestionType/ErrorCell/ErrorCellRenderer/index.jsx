import Icon from "oute-ds-icon";
import React from "react";

import ErrorIcon from "../../../../../../../assets/common/error_icon.svg";

import styles from "./styles.module.scss";

function ErrorCellRenderer(props) {
	const { TD, value } = props;

	TD.className = "error_cell";

	return (
		<div className={styles.container}>
			<span className={styles.text}>{`${value}`}</span>
			<Icon
				imageProps={{
					src: ErrorIcon,
					className: styles.error_icon,
				}}
			/>
		</div>
	);
}

export default ErrorCellRenderer;
