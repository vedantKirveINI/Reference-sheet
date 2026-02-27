import { showAlert } from "oute-ds-alert";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

function useProcessEnrichment() {
	const [{ loading }, processEnrichmentTrigger] = useRequest(
		{
			method: "post",
			url: "/record/v1/enrichment/process_enrichment",
		},
		{ manual: true },
	);

	const { tableId, assetId: baseId, viewId } = useDecodedUrlParams();

	const processEnrichment = async (data) => {
		const { rowId, fieldId } = data || {};

		const payload = {
			tableId,
			baseId,
			viewId,
			id: rowId,
			enrichedFieldId: fieldId,
		};

		try {
			const response = await processEnrichmentTrigger({
				data: payload,
			});
			return response;
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message) ||
					"Could not process enrichment"
				}`,
			});
		}
	};

	return {
		processEnrichment,
		loading,
	};
}

export default useProcessEnrichment;
