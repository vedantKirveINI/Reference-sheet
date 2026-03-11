import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

function useCreateAiEnrichmentTable() {
	const { workspaceId } = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/sheet/create_ai_enrichment_sheet",
		},
		{
			manual: true,
		},
	);

	const createEnrichmentTable = useCallback(
		async (data) => {
			try {
				const response = await trigger({
					data: {
						...data,
						workspace_id: workspaceId,
					},
				});

				showAlert({
					type: "success",
					message: "Ai Enrichment Table created successfully",
				});

				return response;
			} catch (error) {
				const { isCancel } = error || {};

				if (isCancel) return;

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

	return {
		createEnrichmentTable,
		loading,
	};
}

export default useCreateAiEnrichmentTable;
