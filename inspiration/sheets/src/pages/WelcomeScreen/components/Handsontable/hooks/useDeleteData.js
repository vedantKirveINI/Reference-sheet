import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";

const useDeleteData = () => {
	const { tableId, assetId, viewId } = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "put",
			url: "/record/update_records_status",
		},
		{ manual: true },
	);

	const deleteRecord = async ({ deleteRowIds = [] }) => {
		try {
			await trigger({
				data: {
					baseId: assetId,
					tableId,
					viewId,
					...(!isEmpty(deleteRowIds)
						? { records: deleteRowIds }
						: {}),
				},
			});
			showAlert({
				type: "success",
				message: "Successfully deleted rows",
			});
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Could not delete records "
				}`,
			});
		}
	};

	return {
		deleteRecord,
		loading,
	};
};

export default useDeleteData;
