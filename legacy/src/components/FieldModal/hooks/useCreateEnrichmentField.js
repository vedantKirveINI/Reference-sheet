import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

function useCreateEnrichmentField() {
	const [{ data, loading, error }, createEnrichmentFieldTrigger] = useRequest(
		{
			method: "post",
			url: "/field/create_enrichment_field",
		},
		{ manual: true },
	);

	const createEnrichmentField = useCallback(
		async (data) => {
			const { name = "" } = data || {};

			try {
				const response = await createEnrichmentFieldTrigger({
					data,
				});

				showAlert({
					type: "success",
					message: `Field ${truncateName(name, 50)} Updated Successfully`,
				});

				return response;
			} catch (error) {
				showAlert({
					type: "error",
					message: `${
						truncateName(error?.response?.data?.message) ||
						"Something went wrong"
					}`,
				});
			}
		},
		[createEnrichmentFieldTrigger],
	);

	return {
		createEnrichmentField,
		loading,
		error,
		data,
	};
}

export default useCreateEnrichmentField;
