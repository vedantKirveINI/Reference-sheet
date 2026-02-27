import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";

function useWelcomeScreen() {
	const [{ data, loading, error }, trigger] = useRequest(
		{
			method: "post",
			url: "/sheet/create_sheet",
		},
		{
			manual: true,
		},
	);

	const createInitialSheet = useCallback(
		async (payload) => {
			try {
				const response = await trigger({
					data: payload,
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

	return {
		createInitialSheet,
		assetIdData: data,
		loading,
		createSheetError: error,
	};
}

export default useWelcomeScreen;
