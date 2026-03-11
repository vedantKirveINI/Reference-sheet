import ODSButton from "oute-ds-button";

import styles from "./styles.module.scss";

const Footer = ({
	handleClose = () => {},
	handleSave = () => {},
	disabled = false,
}) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="DISCARD"
				onClick={handleClose}
			/>
			<ODSButton
				variant="black"
				label="SAVE"
				onClick={handleSave}
				disabled={disabled}
			/>
		</div>
	);
};

export default Footer;
