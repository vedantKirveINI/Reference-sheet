import Icon from "oute-ds-icon";
import React from "react";

import { CONTACT_PHONE_ICON } from "@/constants/Icons/questionTypeIcons";

import styles from "./styles.module.scss";

const Header = () => {
	return (
		<div className={styles.header_container}>
			<Icon
				imageProps={{
					src: CONTACT_PHONE_ICON,
					className: styles.address_icon,
				}}
			/>
			<div className={styles.header_label}>Contact</div>
		</div>
	);
};

export default Header;
