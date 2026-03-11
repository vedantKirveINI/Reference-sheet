import { showAlert } from "oute-ds-alert";
import { useCallback } from "react";

import useRequest from "../../../hooks/useRequest";

function useRestoreAsset() {
	const [{ data, loading, error }, restoreAssetTrigger] = useRequest(
		{
			method: "post",
			url: "/asset/restore_asset",
		},
		{ manual: true },
	);

	const restoreAsset = useCallback(
		async (assetId) => {
			try {
				const { data: response } = await restoreAssetTrigger({
					data: {
						asset_ids: [assetId],
					},
				});

				return response;
			} catch (error) {
				const { isCancel } = error || {};

				if (isCancel) return;

				showAlert({
					type: "error",
					message: `${
						error?.response?.data?.message || "Something went wrong"
					}`,
				});
			}
		},
		[restoreAssetTrigger],
	);

	return {
		restoreAsset,
		data,
		loading,
		error,
	};
}

export default useRestoreAsset;
