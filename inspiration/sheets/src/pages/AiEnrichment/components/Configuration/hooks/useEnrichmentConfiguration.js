import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";
import { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import { encodeParams } from "../../../../../utils/encodeDecodeUrl";
import { FIELDS_PAYLOAD } from "../constant/companyProspectConstants";

import useCreateAiEnrichmentTable from "./useCreateAiEnrichmentTable";
import useGetPreviewData from "./useGetPreviewData";
import useGetProspectData from "./useGetProspectData";

function useEnrichmentConfiguration() {
	const [previewTableData, setPreviewTableData] = useState([]);
	const [activeStep, setActiveStep] = useState(0);

	const ref = useRef({
		data: [],
		filterData: {
			limitFilter: null,
			icpFilter: null,
			locationFilter: null,
		},
	});

	const navigate = useNavigate();

	const { createEnrichmentTable = () => {}, loading: createTableLoading } =
		useCreateAiEnrichmentTable();

	const {
		getPreviewData = () => {},
		loading: getPreviewDataLoading,
		previewData,
	} = useGetPreviewData();

	const { getProspectData = () => {}, loading: getProspectDataLoading } =
		useGetProspectData();

	const { workspaceId, projectId, parentId, setSearchParams } =
		useDecodedUrlParams();

	const handleGetPreviewData = useCallback(
		async (override_icp = {}) => {
			if (ref.current?.saveAiConfigurationData) {
				const data = await ref.current?.saveAiConfigurationData();

				const { type = {}, url = "" } = data || {};

				const icpInputs = {
					domain: url,
				};

				const prospectingTarget = type?.value;

				const getPreviewDataPayload = {
					prospect_inputs: {
						domain: url,
						prospecting_target: prospectingTarget,
					},
					icp_inputs: icpInputs,
					override_icp: override_icp,
				};

				const response = await getPreviewData(getPreviewDataPayload);
				if (response) {
					const { data: responseData = {} } = response || {};
					ref.current.data[0] = data;
					const tableData = responseData?.prospect?.items || [];

					setPreviewTableData(tableData);
					setActiveStep(1); // Move to step 2 after getting preview data
				}
			}
		},
		[getPreviewData],
	);

	const handleGetSyncData = useCallback(async () => {
		const originalData = ref.current.data[0];
		if (!originalData) {
			showAlert({
				type: "error",
				message:
					"No configuration data available. Please complete the setup first.",
			});
			return;
		}

		const { type = {}, url = "" } = originalData || {};

		const icpFilterRef = ref.current?.filterData?.icpFilter;
		const locationFilterRef = ref.current?.filterData?.locationFilter;

		const [icpData, locationData] = await Promise.all([
			icpFilterRef?.getFilterData?.() || Promise.resolve({}),
			locationFilterRef?.getFilterData?.() || Promise.resolve({}),
		]);

		const normalizeValues = (obj = {}) => {
			const copy = { ...obj };
			Object.entries(copy).forEach(([key, value]) => {
				if (
					Array.isArray(value) &&
					value.length > 0 &&
					typeof value[0] === "object" &&
					value[0] !== null
				) {
					copy[key] = value.map((item) => item?.value ?? item);
				}
			});
			return copy;
		};

		const payload = {
			domain: url,
			prospecting_target: type?.value,
			override_icp: {
				...normalizeValues(icpData),
				...normalizeValues(locationData),
			},
		};

		const response = await getProspectData(payload);
		setPreviewTableData(response?.items || []);
	}, [getProspectData]);

	const handleCreateEnrichmentTable = async () => {
		const data = ref.current.data[0];
		const targetCount =
			await ref.current?.filterData?.limitFilter?.getLimitData();

		const { type = {}, url = "" } = data || {};

		const icpInputs = {
			domain: url,
		};

		const prospectingTarget = type?.value;

		const payload = {
			prospect_inputs: {
				domain: url,
				prospecting_target: prospectingTarget,
				output: {
					target_count: Number(targetCount) || 100,
				},
			},
			icp_inputs: icpInputs,
			fields_payload: FIELDS_PAYLOAD,
			records: previewTableData,
		};

		const response = await createEnrichmentTable(payload);
		if (response) {
			const { base, table, view } = response?.data || {};

			if (isEmpty(base) || isEmpty(table) || isEmpty(view)) {
				showAlert({
					type: "error",
					message:
						"Something went wrong while creating Ai Enriched Table",
				});
				return;
			}

			const baseId = base?.id || "";
			const tableId = table?.id || "";
			const viewId = view?.id || "";

			document.title = base?.name || "Untitled Sheet";

			const newSheetPath = {
				w: workspaceId,
				pj: projectId,
				pr: parentId,
				a: baseId,
				t: tableId,
				v: viewId,
			};

			const newEncodedPath = encodeParams(newSheetPath);
			setSearchParams({ q: newEncodedPath });

			// Navigate back to the base page with the new encoded path
			navigate(`/?q=${newEncodedPath}`);
		}
	};

	const handleContinueClick = async () => {
		try {
			if (activeStep === 0) {
				await handleGetPreviewData();
			} else {
				await handleCreateEnrichmentTable();
			}
		} catch (error) {
			console.log("error ->>", error);
		}
	};

	return {
		ref,
		handleContinueClick,
		handleGetSyncData,
		previewTableData,
		createTableLoading,
		getPreviewDataLoading,
		previewData,
		activeStep,
		setActiveStep,
		getProspectDataLoading,
	};
}

export default useEnrichmentConfiguration;
