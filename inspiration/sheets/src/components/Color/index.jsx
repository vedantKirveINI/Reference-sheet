import React from "react";

import colorPalletIcon from "../../assets/table-sub-header-icons/color_pallate_outlined.svg";

import styles from "./styles.module.scss";

const Color = () => {
	return (
		<div className={styles.colorOption}>
			<div className={styles.colorOptionIcon}>
				<img src={colorPalletIcon} alt="icon" />
			</div>
			<div className={styles.colorOptionLabel}>Color</div>
		</div>
	);
};

export default Color;
