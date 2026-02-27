import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import SignatureIcon from "../../../../../../../../assets/question-type-icons/signature.svg";

import styles from "./styles.module.scss";

function Header({ title = "" }) {
	return (
		<div className={styles.header_container}>
			<ODSIcon
				imageProps={{
					src: SignatureIcon,
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
