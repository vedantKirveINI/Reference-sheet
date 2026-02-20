import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";
import { useState, useRef, useEffect, useCallback } from "react";
import { useFileUpload } from "../../../FilePicker/hooks/useGetFileUploadUrl";
import useDecodedUrlParams from "../../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../../hooks/useRequest";
import { encodeParams } from "../../../../../../utils/encodeDecodeUrl";
import truncateName from "../../../../../../utils/truncateName";
import useTable from "../../../../hooks/useTable";
import { getColumnConfigsFromArray } from "../../CopyOfImportCSV/utils/columnMetaForCsvData";
import useFetchAndParseCsv from "./useReadCSV";

function useImportCSV({
	selectedTableIdWithViewId = {},
	source = "",
	setOpen = () => {},
	setSource = () => {},
	setView = () => {},
	leaveRoom = () => {},
}) {
	const {
		decodedParams,
		setSearchParams,
		assetId,
		tableId: currentTableId = "",
	} = useDecodedUrlParams();

	const [currentStep, setCurrentStep] = useState(source ? 0 : 1);
	const [formData, setFormData] = useState({ fileName: "" });
	const [selectedfiles, setSelectedFiles] = useState([]);
	const [filesError, setFilesError] = useState();

	const ref = useRef(null);

	const { fetchFileData } = useFetchAndParseCsv();
	const { data, getTableFields } = useTable();

	const [{ loading: isCSVUploading = false }, trigger] = useRequest(
		{
			method: "post",
			url: "/table/add_csv_data_to_existing_table",
		},
		{ manual: true },
	);

	const [{ loading: isCSVUploadingInNewTable = false }, importCSVInNewTable] =
		useRequest(
			{
				method: "post",
				url: "/table/add_csv_data_to_new_table",
			},
			{ manual: true },
		);

	const { tableId: selectedTableId = "", viewId: selectedViewId = "" } =
		selectedTableIdWithViewId || {};

	const {
		uploadData,
		loading: apiLoading,
		error: apiError,
		uploadFiles,
	} = useFileUpload({
		files: selectedfiles,
	});

	const updateExistingTableWithCSV = useCallback(
		async (payload) => {
			try {
				const response = await trigger({
					data: {
						...payload,
					},
				});

				showAlert({
					type: "success",
					message: "File Imported Successfully",
				});

				return response;
			} catch (error) {
				showAlert({
					type: "error",
					message: `${
						truncateName(error?.response?.data?.message, 50) ||
						"Something went wrong"
					}`,
				});
			}
		},
		[trigger],
	);

	const importCSVIntoNewTable = useCallback(
		async (payload) => {
			try {
				const response = await importCSVInNewTable({
					data: {
						...payload,
					},
				});

				showAlert({
					type: "success",
					message: "File Imported Successfully",
				});

				return response;
			} catch (error) {
				showAlert({
					type: "error",
					message: `${
						truncateName(error?.response?.data?.message, 50) ||
						"Something went wrong"
					}`,
				});
			}
		},
		[importCSVInNewTable],
	);

	const handleProceed = () => {
		setCurrentStep((prev) => prev + 1);
	};

	const handlePrevious = () => {
		if (source && currentStep === 5) {
			setCurrentStep((prev) => prev - 3);
		} else if (
			formData?.update_existing_table === "Create new column" &&
			currentStep === 5
		) {
			setCurrentStep((prev) => prev - 2);
		} else {
			setCurrentStep((prev) => prev - 1);
		}
	};

	const handleClose = () => {
		setOpen("");
		setSource("");
		setCurrentStep(1);
		setFormData({ fileName: "" });
	};

	const handleSaveData = async () => {
		try {
			const saveData = await ref.current.saveFormData();

			if (currentStep === 2 && !source) {
				const hasUnmappedField = saveData?.columnsInfo?.some(
					(element) => element.hasOwnProperty("unMappedCsvName"),
				);

				if (hasUnmappedField) {
					setFormData((prev) => ({ ...prev, ...saveData }));
					handleProceed();
					return;
				}
			}

			if (currentStep === 2 || currentStep === 3 || currentStep === 5) {
				await handleCSVSubmission({ ...formData, ...saveData });
				handleClose();
				return;
			}

			setFormData((prev) => ({ ...prev, ...saveData }));

			handleProceed();
		} catch {}
	};

	const handleCSVSubmission = async (data) => {
		const {
			columnsInfo = [],
			first_row_as_header = "",
			uploadedFileInfo = {},
			table_name = "",
			parsedCSVData = [],
		} = data || {};

		const columnTypes = [];

		columnsInfo.forEach((element) => {
			const value = element?.type;

			columnTypes.push(value);
		});

		if (source) {
			const configs = getColumnConfigsFromArray(
				parsedCSVData,
				columnTypes,
			);

			columnsInfo.forEach((columnInfo, index) => {
				columnsInfo[index] = {
					...columnInfo,
					meta: configs[index],
				};
			});
		}

		const sanitizedColumnsInfo = columnsInfo.map(
			({ mappedCsvName, unMappedCsvName, ...rest }) => rest,
		); // remove mappedCsvName and unMappedCsvName from columnsInfo

		const payload = {
			is_first_row_header: first_row_as_header === "Yes",
			columns_info: sanitizedColumnsInfo,
			url: uploadedFileInfo?.url,
			baseId: assetId,
			...(source
				? { table_name }
				: { tableId: selectedTableId, viewId: selectedViewId }),
		};

		if (!source) {
			await updateExistingTableWithCSV(payload);
			return;
		}

		const { data: responseData = {} } =
			await importCSVIntoNewTable(payload);

		const { table = {}, view = {} } = responseData || {};

		setView(view);

		const updatedParams = {
			...decodedParams,
			t: table?.id || "",
			v: view?.id || "",
		};

		const newEncodedParams = encodeParams(updatedParams);

		await leaveRoom({ roomId: currentTableId });

		setSearchParams({ q: newEncodedParams });
	};

	const handleUpload = async () => {
		if (!isEmpty(formData?.uploadedFileInfo)) {
			handleProceed();
			return;
		}

		try {
			const response = await uploadFiles();

			if (isEmpty(response)) {
				throw new Error();
			}

			const fileName = isEmpty(selectedfiles)
				? "-"
				: selectedfiles[0]?.name;
			const uploadedFileInfo = response[0];
			const csvData = await fetchFileData({ url: uploadedFileInfo?.url });

			setFormData((prev) => ({
				...prev,
				uploadedFileInfo,
				fileName,
				parsedCSVData: csvData,
			}));

			handleProceed();
		} catch {
			showAlert({
				type: "error",
				message: "Could not upload file",
			});
		}
	};

	useEffect(() => {
		if (isEmpty(selectedfiles)) {
			setFormData((prev) => ({
				...prev,
				parsedCSVData: undefined,
				uploadedFileInfo: undefined,
				fileName: "",
			}));
		}
	}, [selectedfiles]);

	useEffect(() => {
		const fetchTableFields = async () => {
			try {
				await getTableFields({
					tableId: selectedTableId,
					viewId: selectedViewId,
					isFieldRequired: true,
				});
			} catch {}
		};

		if (!source) {
			fetchTableFields();
		}
	}, [source, selectedTableId]);

	return {
		formData,
		ref,
		currentStep,
		data,
		isCSVUploading,
		handleClose,
		handleSaveData,
		handlePrevious,
		uploadData,
		apiLoading,
		apiError,
		selectedfiles,
		setSelectedFiles,
		setFilesError,
		handleUpload,
		isCSVUploadingInNewTable,
		filesError,
	};
}
export default useImportCSV;
