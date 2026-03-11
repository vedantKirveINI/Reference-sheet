import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";

function useSheet() {
	const [{ data, loading, error }, trigger] = useRequest(
		{
			method: "post",
			url: "/sheet/get_sheet",
		},
		{
			manual: true,
		},
	);

	const getSheet = useCallback(
		async (data) => {
			try {
				const sheet = await trigger({
					data: {
						baseId: data,
					},
				});
				return sheet;
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
		getSheet,
		data,
		loading,
		error,
	};
}

export default useSheet;
