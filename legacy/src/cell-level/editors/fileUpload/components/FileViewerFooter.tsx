import React from "react";
import ODSButton from "oute-ds-button";
import styles from "./FileViewerFooter.module.css";

interface FileViewerFooterProps {
	onClose: () => void;
	onAddFiles: () => void;
}

export const FileViewerFooter: React.FC<FileViewerFooterProps> = ({
	onClose,
	onAddFiles,
}) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="CLOSE"
				onClick={onClose}
			/>
			<ODSButton variant="black" label="ADD MORE" onClick={onAddFiles} />
		</div>
	);
};
