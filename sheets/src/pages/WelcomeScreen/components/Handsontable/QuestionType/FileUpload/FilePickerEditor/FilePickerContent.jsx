import isEmpty from "lodash/isEmpty";
import ODSButton from "oute-ds-button";
import ODSDialog from "oute-ds-dialog";
import { forwardRef } from "react";
import { useEffect } from "react";

import FilePicker from "../../../../../../../components/FilePicker";
import DialogHeader from "../../../../../../../components/FilePicker/DialogHeader";
import { useFileUpload } from "../../../../../../../components/FilePicker/hooks/useGetFileUploadUrl";

import FileContent from "./FileViewer/FileViewerContent";
import ViewFooter from "./FileViewer/FileViewerFooter";
import useFilePickerContent from "./hooks/useFilePickerContent";
import styles from "./styles.module.scss";
function FilePickerContent(props, ref) {
	const { setIsFileUploadOpen } = props;
	const {
		files = [],
		setFiles = () => {},
		handleFileSave = () => {},
		activeModal = "",
		setActiveModal = () => {},
		closeActiveModal,
		settings = {},
		selectedfiles,
		setSelectedFiles,
		setFilesError,
		filesError,
		fieldName = "",
	} = useFilePickerContent(props);

	const {
		uploadData,
		loading: apiLoading,
		error,
		uploadFiles,
		abortUpload,
	} = useFileUpload({
		files: selectedfiles,
	});

	const handleCancel = () => {
		abortUpload();
		setSelectedFiles([]);
		closeActiveModal({ files });
	};

	const handleUpload = async () => {
		const response = await uploadFiles();
		setFiles((prev) => [...prev, ...response]);
		closeActiveModal({ files: [...files, ...response] });
	};

	useEffect(() => {
		if (files.length > 0) {
			setActiveModal("ViewModal");
		} else {
			setActiveModal("UploadModal");
		}
		setIsFileUploadOpen(true);
	}, []);

	return (
		<div data-testid="editor-file-picker-content">
			{activeModal === "UploadModal" && (
				<ODSDialog
					open={activeModal}
					dialogWidth="39rem"
					dialogHeight="auto"
					showFullscreenIcon={false}
					onKeyDown={(e) => e.stopPropagation()}
					hideBackdrop={false}
					onClose={() => setActiveModal((prev) => !prev)}
					draggable={false}
					dialogTitle={<DialogHeader title={fieldName} />}
					removeContentPadding
					dialogContent={
						<FilePicker
							files={selectedfiles}
							setFiles={setSelectedFiles}
							uploadData={uploadData}
							loading={apiLoading}
							error={error}
							setFilesError={setFilesError}
							settings={settings}
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
								disabled={
									apiLoading || // 1. API is loading
									selectedfiles.length === 0 || // 2. No files selected
									!isEmpty(filesError) // 3. Errors in files
								}
								variant="black"
								label="UPLOAD"
								onClick={handleUpload}
							/>
						</div>
					}
				/>
			)}
			{activeModal === "ViewModal" && files.length > 0 && (
				<ODSDialog
					open={activeModal}
					draggable={false}
					showFullscreenIcon={false}
					onKeyDown={(e) => e.stopPropagation()}
					onClose={() => closeActiveModal({ files })}
					dialogWidth="37.5rem"
					dialogHeight="auto"
					dialogTitle={<DialogHeader title={fieldName} />}
					dialogContent={
						<FileContent
							files={files}
							setFiles={setFiles}
							onSave={handleFileSave}
							setActiveModal={setActiveModal}
						/>
					}
					dialogActions={
						<ViewFooter
							onClose={() => closeActiveModal({ files })}
							onAddFiles={() => {
								setActiveModal("UploadModal");
								setIsFileUploadOpen(true);
							}}
						/>
					}
					removeContentPadding
				/>
			)}
		</div>
	);
}

export default forwardRef(FilePickerContent);
