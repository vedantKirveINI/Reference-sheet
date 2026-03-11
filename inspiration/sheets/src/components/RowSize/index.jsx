import React from "react";

import rowSizeIcon from "../../assets/table-sub-header-icons/row_size.svg";

import styles from "./styles.module.scss";

const RowSize = () => {
	return (
		<div className={styles.rowSizeOption}>
			<div className={styles.rowSizeOptionIcon}>
				<img src={rowSizeIcon} alt="icon" />
			</div>
			<div className={styles.rowSizeOptionLabel}>Row Size</div>
		</div>
	);
};

export default RowSize;
