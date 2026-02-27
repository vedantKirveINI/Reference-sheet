import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

function useCreateRecord() {
	const [{ data, loading, error }, trigger] = useRequest(
		{
			method: "post",
			url: "/row_create",
		},
		{
			manual: true,
		},
	);

	const createNewRecord = useCallback(
		async (data) => {
			try {
				const tableInfoResponse = await trigger({
					data: {
						...data,
					},
				});
				return tableInfoResponse;
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

	return {
		createNewRecord,
		data,
		loading,
		error,
	};
}

export default useCreateRecord;
