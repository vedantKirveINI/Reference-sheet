import isEmpty from "lodash/isEmpty";
import ODSButton from "oute-ds-button";
import ODSDialog from "oute-ds-dialog";

import FilePicker from "../../../../../../../components/FilePicker";
import DialogHeader from "../../../../../../../components/FilePicker/DialogHeader";
import FileViewerContent from "../../../QuestionType/FileUpload/FilePickerEditor/FileViewer/FileViewerContent";

import styles from "./styles.module.scss";
import useFileUploadField from "./useFileUploadField";

const FileUploadField = ({ value = "[]", onChange, field }) => {
	const {
		open,
		files,
		error,
		isUploadDisabled,
		handleClick,
		onClose,
		handleCancel,
		handleUpload,
		setFiles,
		setError,
		onRemoveFile,
		fileExisting,
		setFileExisting,
	} = useFileUploadField({ value, onChange });

	const { name: fieldName = "" } = field || {};

	return (
		<div>
			<ODSButton
				variant="black-outlined"
				onClick={handleClick}
				label="UPLOAD FILES"
			/>
			{!isEmpty(fileExisting) && (
				<FileViewerContent
					files={fileExisting}
					setFiles={setFileExisting}
					source={"expanded-row"}
					onSave={onRemoveFile}
				/>
			)}
			<ODSDialog
				open={open}
				dialogWidth="39rem"
				dialogHeight="auto"
				showFullscreenIcon={false}
				onKeyDown={(e) => e.stopPropagation()}
				hideBackdrop={false}
				onClose={onClose}
				draggable={false}
				dialogTitle={<DialogHeader title={fieldName} />}
				removeContentPadding
				dialogContent={
					<FilePicker
						files={files}
						setFiles={setFiles}
						setFilesError={setError}
						error={error}
					/>
				}
				dialogActions={
					<div className={styles.actions}>
						<ODSButton
							variant="black-outlined"
							label="CANCEL"
							onClick={handleCancel}
						/>
						<ODSButton
							disabled={isUploadDisabled}
							variant="black"
							label="UPLOAD"
							onClick={handleUpload}
						/>
					</div>
				}
			/>
		</div>
	);
};

export default FileUploadField;
