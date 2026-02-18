import ODSIcon from "oute-ds-icon";

import { TITLE_ICON, TITLE_TYPING } from "../../constant";

import styles from "./styles.module.scss";

function DialogTitle({ currentStep = 1, formData = {} }) {
	const title = TITLE_TYPING[currentStep] || formData?.fileName;

	const titleIcon = TITLE_ICON[currentStep];

	return (
		<div className={styles.title_container}>
			{titleIcon && (
				<ODSIcon
					outeIconName={titleIcon?.outeIconName}
					outeIconProps={{
						...titleIcon?.outeIconProps,
						sx: {
							...titleIcon?.outeIconProps?.sx,
							color: titleIcon?.outeIconProps?.sx?.color || "#263238",
						},
						className: styles.title_icon,
					}}
				/>
			)}

			<div className={styles.title}>{title || "Import File"}</div>
		</div>
	);
}

export default DialogTitle;
