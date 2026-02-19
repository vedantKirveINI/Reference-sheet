import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

function useUpdateEnrichmentField() {
	const [{ data, loading, error }, trigger] = useRequest(
		{
			method: "post",
			url: "/field/update_enrichment_field",
		},
		{
			manual: true,
		},
	);

	const updateEnrichmentField = useCallback(
		async (data) => {
			const { name = "" } = data;

			try {
				const fieldUpdateResponse = await trigger({
					data: {
						...data,
					},
				});

				showAlert({
					type: "success",
					message: `Field ${truncateName(name, 50)} Updated Successfully`,
				});

				return fieldUpdateResponse;
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
		[trigger],
	);

	return {
		updateEnrichmentField,
		data,
		loading,
		error,
	};
}

export default useUpdateEnrichmentField;
