import { Upload, FileText, Settings, Database } from "lucide-react";

import { TITLE_TYPING } from "../../constant";

import styles from "./styles.module.scss";

const STEP_ICONS = {
	1: Upload,
	2: FileText,
	3: Settings,
	4: Database,
};

function DialogTitle({ currentStep = 1, formData = {} }) {
	const title = TITLE_TYPING[currentStep] || formData?.fileName;
	const IconComponent = STEP_ICONS[currentStep] || Upload;

	return (
		<div className={styles.title_container}>
			<IconComponent
				style={{
					width: "1.5rem",
					height: "1.5rem",
					color: "#263238",
				}}
				className={styles.title_icon}
			/>
			<div className={styles.title}>{title || "Import File"}</div>
		</div>
	);
}

export default DialogTitle;
