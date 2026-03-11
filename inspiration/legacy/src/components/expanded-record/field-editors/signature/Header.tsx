import React from "react";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import { SIGNATURE_ICON } from "@/constants/Icons/questionTypeIcons";
import styles from "./Header.module.scss";

interface HeaderProps {
	title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "" }) => {
	return (
		<div className={styles.header_container}>
			<ODSIcon
				imageProps={{
					src: SIGNATURE_ICON,
					className: styles.signature_icon,
				}}
			/>
			<ODSLabel sx={{ fontFamily: "Inter", fontWeight: "400" }}>
				{title}
			</ODSLabel>
		</div>
	);
};

export default Header;
