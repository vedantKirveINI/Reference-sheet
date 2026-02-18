import FilePicker from "../../../../FilePicker";
import { FILE_UPLOAD_SETTINGS } from "../../constant";

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
			className="py-3 px-2"
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
