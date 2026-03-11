import ODSButton from "oute-ds-button";

import styles from "./styles.module.scss";

function ExpandedRowFooter({ onCancel = () => {}, onSave = () => {} }) {
	return (
		<div className={styles.footer}>
			<ODSButton
				variant="black-outlined"
				label="CANCEL"
				onClick={onCancel}
				sx={{ marginRight: "0.5rem" }}
			/>
			<ODSButton variant="black" label="SAVE" onClick={onSave} />
		</div>
	);
}

export default ExpandedRowFooter;
