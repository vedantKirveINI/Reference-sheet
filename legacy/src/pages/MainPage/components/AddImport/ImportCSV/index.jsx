import isEmpty from "lodash/isEmpty";
import ODSDialog from "oute-ds-dialog";
import ODSIcon from "oute-ds-icon";

import AddTableName from "./common/AddTableName";
import CSVUpload from "./common/CSVUpload";
import DialogActions from "./common/DialogActions";
import DialogTitle from "./common/DialogTitle";
import FieldConfiguration from "./common/FieldConfiguration";
import FieldConfigurationExistingTable from "./common/FieldConfigurationExistingTable";
import MapDataType from "./common/MapDataType";
import useImportCSV from "./hooks/useImportCSV";

function ImportCSV({
	open = "importTable",
	selectedTableIdWithViewId = {},
	source = "",
	setOpen = () => {},
	setSource = () => {},
	setView = () => {},
	leaveRoom = () => {},
}) {
	const {
		formData = {},
		ref,
		currentStep = 1,
		data = {},
		isCSVUploading = false,
		handleClose = () => {},
		handleSaveData = () => {},
		handlePrevious = () => {},
		uploadData = [],
		apiLoading = false,
		apiError,
		selectedfiles = [],
		setSelectedFiles,
		setFilesError,
		handleUpload = () => {},
		isCSVUploadingInNewTable = false,
		filesError = "",
	} = useImportCSV({
		setOpen,
		selectedTableIdWithViewId,
		source,
		setSource,
		setView,
		leaveRoom,
	});

	// Map step numbers to content components
	const DIALOG_CONTENT = {
		0: (
			<AddTableName
				ref={ref}
				formData={formData}
				handleSaveData={handleSaveData}
			/>
		),
		1: (
			<CSVUpload
				files={selectedfiles}
				setFiles={setSelectedFiles}
				uploadData={uploadData}
				loading={apiLoading}
				error={apiError}
				setFilesError={setFilesError}
			/>
		),
		2:
			!isEmpty(data) && !source ? (
				<FieldConfigurationExistingTable
					ref={ref}
					formData={formData}
					tableInfo={data}
				/>
			) : (
				<FieldConfiguration ref={ref} formData={formData} />
			),
		3: <MapDataType ref={ref} formData={formData} />,
	};

	// Map step numbers to dialog actions
	const DIALOG_ACTIONS = {
		0: (
			<DialogActions
				secondaryAction={handleClose}
				primaryAction={handleSaveData}
				primaryLabel="PROCEED"
				secondaryLabel="DISCARD"
			/>
		),
		1: (
			<DialogActions
				secondaryAction={handleClose}
				primaryAction={handleUpload}
				onPrevious={source && handlePrevious}
				loading={
					apiLoading || isCSVUploadingInNewTable || isCSVUploading
				}
				primaryLabel={
					isEmpty(formData?.uploadedFileInfo) ? "IMPORT" : "PROCEED"
				}
				backLabel={source && "BACK"}
				disableSubmit={isEmpty(selectedfiles) || !isEmpty(filesError)}
			/>
		),
		2: (
			<DialogActions
				secondaryAction={() => {
					ref.current?.addField?.();
				}}
				secondaryLabel={"ADD FIELD"}
				primaryAction={handleSaveData}
				primaryLabel={
					isEmpty(formData?.uploadedFileInfo) ? "IMPORT" : "PROCEED"
				}
				onPrevious={handlePrevious}
				backLabel={"BACK"}
				loading={isCSVUploadingInNewTable || isCSVUploading}
				disableSubmit={isEmpty(selectedfiles)}
				secondaryButtonProps={{
					startIcon: (
						<ODSIcon
							outeIconName="OUTEAddIcon"
							outeIconProps={{
								sx: {
									color:
										isCSVUploadingInNewTable ||
										isCSVUploading
											? "#BABABA"
											: "#212121",
								},
							}}
						/>
					),
					sx: { padding: "0.75rem 1rem" },
				}}
			/>
		),
		default: (
			<DialogActions
				secondaryAction={handlePrevious}
				primaryAction={handleSaveData}
				loading={isCSVUploading}
				secondaryLabel={"BACK"}
			/>
		),
	};

	return (
		<ODSDialog
			open={open}
			dialogWidth="45rem"
			showFullscreenIcon={false}
			hideBackdrop={false}
			onClose={handleClose}
			draggable={false}
			dialogTitle={
				<DialogTitle currentStep={currentStep} formData={formData} />
			}
			onKeyDown={(e) => e.stopPropagation()}
			dialogContent={DIALOG_CONTENT[currentStep] || null}
			removeContentPadding
			dialogActions={
				DIALOG_ACTIONS[currentStep] || DIALOG_ACTIONS.default
			}
		/>
	);
}

export default ImportCSV;
