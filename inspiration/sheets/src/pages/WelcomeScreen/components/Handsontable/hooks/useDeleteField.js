import { showAlert } from "oute-ds-alert";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

const useDeleteField = ({ setIsDeleteFieldOpen = () => {} }) => {
	const { tableId, assetId, viewId } = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/field/update_fields_status",
		},
		{ manual: true },
	);

	const deleteField = async (data) => {
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
				message: "Successfully deleted fields",
			});
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Could not delete fields "
				}`,
			});
		}

		setIsDeleteFieldOpen(false);
	};

	return {
		deleteField,
		loading,
	};
};

export default useDeleteField;
