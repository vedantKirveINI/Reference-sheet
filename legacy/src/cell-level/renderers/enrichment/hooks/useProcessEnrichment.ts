import { showAlert } from "@/lib/toast";
import { useCallback } from "react";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import truncateName from "@/utils/truncateName";
import useRequest from "@/hooks/useRequest";

function useProcessEnrichment() {
	const { tableId, assetId: baseId, viewId } = useDecodedUrlParams();

	const [{}, trigger] = useRequest(
		{
			method: "post",
			url: "/record/v1/enrichment/process_enrichment",
		},
		{ manual: true },
	);

	const processEnrichment = useCallback(
		async (
			data: {
				rowId: string;
				fieldId: string;
			},
			onComplete?: () => void,
		) => {
			const { rowId, fieldId } = data || {};

			const payload = {
				tableId,
				baseId,
				viewId,
				id: rowId,
				enrichedFieldId: fieldId,
			};

			try {
				const response = await trigger({
					data: payload,
					params: {
						_t: Date.now(),
						_r: rowId,
						_f: fieldId,
					},
				});
				return response;
			} catch (error: any) {
				const { isCancel } = error || {};

				if (isCancel) {
					onComplete?.();
					return;
				}

				showAlert({
					type: "error",
					message: `${
						truncateName(error?.response?.data?.message) ||
						"Could not process enrichment"
					}`,
				});
				onComplete?.();
			}
		},
		[trigger, tableId, baseId, viewId],
	);

	return {
		processEnrichment,
	};
}

export default useProcessEnrichment;
