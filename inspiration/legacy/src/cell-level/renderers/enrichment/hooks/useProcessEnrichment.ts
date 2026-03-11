import { showAlert } from "oute-ds-alert";
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
				// Add unique timestamp to prevent browser-level request deduplication
				// This ensures each enrichment request is treated as unique
				const response = await trigger({
					data: payload,
					params: {
						_t: Date.now(),
						_r: rowId,
						_f: fieldId,
					},
				});
				// Note: Don't clear loading state here - it will be cleared when socket 'updated_row' event is received
				// onComplete callback is kept for potential future use but not called on success
				return response;
			} catch (error: any) {
				const { isCancel } = error || {};

				if (isCancel) {
					// On cancel, call onComplete if provided (for error handling)
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
				// On error, call onComplete if provided (socket event won't come, so clear loading here)
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
