import FilePicker from "../../../../../../../components/FilePicker";
import { FILE_UPLOAD_SETTINGS } from "../../constant";

import styles from "./styles.module.scss";

function CSVUpload({
	files = [],
	setFiles,
	uploadData = [],
	loading = false,
	error,
	setFilesError,
}) {
	return (
		<div
			className={styles.file_upload_container}
			data-testid="import-csv-file-upload"
		>
			<FilePicker
				files={files}
				setFiles={setFiles}
				uploadData={uploadData}
				loading={loading}
				error={error}
				setFilesError={setFilesError}
				settings={FILE_UPLOAD_SETTINGS}
			/>
		</div>
	);
}

export default CSVUpload;
