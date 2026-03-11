import Icon from "oute-ds-icon";
import React from "react";

import { FILE_UPLOAD_ICON } from "../../../../../../../../../constants/Icons/questionTypeIcons";
import styles from "../styles.module.scss";

const Header = () => {
	return (
		<div className={styles.header_container}>
			<Icon
				imageProps={{
					src: FILE_UPLOAD_ICON,
				}}
			/>

			<div>File Upload</div>
		</div>
	);
};

export default Header;
