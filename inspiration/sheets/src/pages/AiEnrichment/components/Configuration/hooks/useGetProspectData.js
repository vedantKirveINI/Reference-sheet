import { showAlert } from "oute-ds-alert";
import { useCallback, useState } from "react";

import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

function useGetProspectData() {
	const [manualLoading, setManualLoading] = useState(false);
	const [{ data: prospectData }, trigger] = useRequest(
		{
			method: "post",
			url: `/table/prospect/run?sync=true`,
		},
		{
			manual: true,
		},
	);

	const getProspectData = useCallback(
		async (payload) => {
			try {
				setManualLoading(true);
				const response = await trigger({
					data: {
						...payload,
					},
				});

				const { data = {} } = response || {};
				setManualLoading(false);
				return data;
			} catch (error) {
				const { isCancel } = error || {};

				if (isCancel) {
					return;
				}

				setManualLoading(false);
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
		getProspectData,
		loading: manualLoading,
		prospectData,
	};
}

export default useGetProspectData;
