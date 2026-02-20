import { showAlert } from "oute-ds-alert";

import useRequest from "../../../../../hooks/useRequest";

function useFindOneAsset() {
	const [{ data, error, loading: findOneAssetLoading }, findOneAssetTrigger] =
		useRequest(
			{
				method: "GET",
				url: "/asset/find_one",
			},
			{ manual: true },
		);

	const getOneAsset = async (assetId) => {
		try {
			const response = await findOneAssetTrigger({
				params: {
					_id: assetId,
				},
			});

			return response?.data || [];
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
	};

	return {
		getOneAsset,
		data,
		error,
		findOneAssetLoading,
	};
}

export default useFindOneAsset;
