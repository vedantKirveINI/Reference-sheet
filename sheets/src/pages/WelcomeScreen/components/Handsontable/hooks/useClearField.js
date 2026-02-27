import { showAlert } from "oute-ds-alert";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

const useClearField = ({ setIsDeleteFieldOpen = () => {} }) => {
	const { tableId, assetId, viewId } = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/field/clear_fields_data",
		},
		{ manual: true },
	);

	const clearField = async (data) => {
		try {
			await trigger({
				data: {
					baseId: assetId,
					tableId,
					viewId,
					fields: data,
				},
			});

			showAlert({
				type: "success",
				message: "Successfully cleared fields",
			});
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Could not clear fields "
				}`,
			});
		}

		setIsDeleteFieldOpen(false);
	};

	return {
		clearField,
		loading,
	};
};

export default useClearField;
