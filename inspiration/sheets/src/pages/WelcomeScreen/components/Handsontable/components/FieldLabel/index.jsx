import ODSIcon from "oute-ds-icon";

import QUESTION_TYPE_ICON_MAPPING from "../../../../../../constants/questionTypeIconMapping";

import styles from "./styles.module.scss";

function FieldLabel({ label = "", children, type = "", isLastIndex = false }) {
	const iconSrc = type ? QUESTION_TYPE_ICON_MAPPING[type] : null;

	return (
		<div
			className={styles.field_label_container}
			style={{ marginBottom: isLastIndex ? "0rem" : "2.5rem" }}
		>
			<div className={styles.label_wrapper}>
				{iconSrc && (
					<ODSIcon
						imageProps={{
							src: iconSrc,
							className: styles.icon,
						}}
					/>
				)}
				<div className={styles.label}>{label}</div>
			</div>
			<div className={styles.content}>{children}</div>
		</div>
	);
}

export default FieldLabel;
