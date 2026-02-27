import ODSIcon from "oute-ds-icon";

import { TITLE_ICON, TITLE_TYPING } from "../../constant";

import styles from "./styles.module.scss";

function DialogTitle({ currentStep = 1, formData = {} }) {
	const title = TITLE_TYPING[currentStep] || formData?.fileName;

	const titleIcon = TITLE_ICON[currentStep];

	return (
		<div className={styles.title_container}>
			{titleIcon?.imageProps ? (
				<ODSIcon
					outeIconName={titleIcon?.outeIconName}
					outeIconProps={{
						...titleIcon?.imageProps,
						className: styles.title_icon,
					}}
				/>
			) : (
				<ODSIcon {...titleIcon} />
			)}

			<div className={styles.title}>{title || "Import File"}</div>
		</div>
	);
}

export default DialogTitle;
