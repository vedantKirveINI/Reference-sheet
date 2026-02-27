import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

function useGetPreviewData() {
	const { workspaceId } = useDecodedUrlParams();

	const [{ data: previewData, loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/table/icp-prospect/process",
		},
		{
			manual: true,
		},
	);

	const getPreviewData = useCallback(
		async (payload) => {
			try {
				const response = await trigger({
					data: {
						...payload,
						workspace_id: workspaceId,
					},
				});

				const { data = {} } = response || {};
				return data;
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
		getPreviewData,
		loading,
		previewData,
	};
}

export default useGetPreviewData;
