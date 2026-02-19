import isEmpty from "lodash/isEmpty";
import { Upload } from "lucide-react";

import FileCounterDisplay from "./FileCounterDisplay";
import FilePreview from "./FilesPreview";
import styles from "./styles.module.scss";

function DialogContent({
	getRootProps = () => {},
	getInputProps,
	files = [],
	removeFile = () => {},
	loading = false,
	error = null,
	errorMap = {},
	noOfFilesAllowed = 100,
}) {
	const hasReachedFileLimit = files.length >= noOfFilesAllowed;

	return (
		<div className={styles.wrapper}>
			{hasReachedFileLimit ? (
				<FileCounterDisplay fileCount={files.length} />
			) : (
				<div {...getRootProps()} className={styles.dropzone}>
					<input {...getInputProps()} />
					<Upload
						style={{
							height: "50px",
							width: "40px",
							color: "#212121",
						}}
					/>
					<div className={styles.instruction}>
						Drag & drop or{" "}
						<span className={styles.underline}>Choose file</span> to
						upload.
					</div>
				</div>
			)}

			{!isEmpty(files) && (
				<FilePreview
					removeFile={removeFile}
					files={files}
					loading={loading}
					error={error}
					errorMap={errorMap}
				/>
			)}
		</div>
	);
}

export default DialogContent;
