import { Error } from "@oute/oute-ds.atom.error";
import { FilePicker } from "@oute/oute-ds.molecule.file-picker";
import { forwardRef } from "react";

import styles from "./styles.module.scss";

const FileUploadModal = (
	{
		loading = false,
		settings = {},
		fileUploadError = "",
		setFileUploadError = () => {},
	},
	ref,
) => {
	return (
		<div className={styles.fileContainer}>
			<FilePicker
				ref={ref}
				disabled={loading}
				settings={{ fileSize: 10, allowedFileTypes: [], ...settings }}
				onEvent={() => setFileUploadError("")}
			/>
			{fileUploadError && (
				<Error
					text={fileUploadError}
					style={{
						fontSize: "0.75rem",
						padding: "0.25rem 0.5rem",
					}}
				/>
			)}
		</div>
	);
};

export default forwardRef(FileUploadModal);
