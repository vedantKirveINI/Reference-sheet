import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";


import styles from "./styles.module.scss";
import { SIGNATURE_ICON } from "../../../../../constants/Icons/questionTypeIcons";

function Header({ title = "" }) {
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
}

export default Header;
