import isEmpty from "lodash/isEmpty";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

import AddTableName from "./common/AddTableName";
import CSVUpload from "./common/CSVUpload";
import DialogActionsComp from "./common/DialogActions";
import DialogTitleComp from "./common/DialogTitle";
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

	const DIALOG_ACTIONS = {
		0: (
			<DialogActionsComp
				secondaryAction={handleClose}
				primaryAction={handleSaveData}
				primaryLabel="PROCEED"
				secondaryLabel="DISCARD"
			/>
		),
		1: (
			<DialogActionsComp
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
			<DialogActionsComp
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
						<Plus
							style={{
								width: "1rem",
								height: "1rem",
								color:
									isCSVUploadingInNewTable ||
									isCSVUploading
										? "#BABABA"
										: "#212121",
							}}
						/>
					),
				}}
			/>
		),
		default: (
			<DialogActionsComp
				secondaryAction={handlePrevious}
				primaryAction={handleSaveData}
				loading={isCSVUploading}
				secondaryLabel={"BACK"}
			/>
		),
	};

	return (
		<Dialog open={!!open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
			<DialogContent className="max-w-[45rem]" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>
						<DialogTitleComp currentStep={currentStep} formData={formData} />
					</DialogTitle>
				</DialogHeader>
				{DIALOG_CONTENT[currentStep] || null}
				<DialogFooter>
					{DIALOG_ACTIONS[currentStep] || DIALOG_ACTIONS.default}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ImportCSV;
