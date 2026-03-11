import React from "react";

import groupIcon from "../../assets/table-sub-header-icons/group_icon.svg";

import styles from "./styles.module.scss";

const Group = () => {
	return (
		<div className={styles.groupOption}>
			<div className={styles.groupOptionIcon}>
				<img src={groupIcon} alt="icon" />
			</div>
			<div className={styles.groupOptionLabel}>Group</div>
		</div>
	);
};

export default Group;
