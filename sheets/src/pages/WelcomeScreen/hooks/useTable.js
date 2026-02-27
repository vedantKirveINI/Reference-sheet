import { showAlert } from "oute-ds-alert";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";

function useTable() {
	const { assetId } = useDecodedUrlParams();

	const [{ data, loading }, getTableTrigger] = useRequest(
		{
			method: "get",
			url: "/table/get_table",
		},
		{ manual: true },
	);

	const getTableFields = async ({
		tableId,
		viewId,
		isFieldRequired = false,
		isViewRequired = false,
	}) => {
		try {
			const response = await getTableTrigger({
				params: {
					tableId,
					viewId,
					baseId: assetId,
					is_field_required: isFieldRequired,
					is_view_required: isViewRequired,
				},
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
	};

	return {
		data,
		loading,
		getTableFields,
	};
}

export default useTable;
