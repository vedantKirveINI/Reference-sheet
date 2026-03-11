// Hook to delete a view
import { showAlert } from "oute-ds-alert";
import useRequest from "@/hooks/useRequest";
import type { IDeleteViewPayload } from "@/types/view";
import truncateName from "@/utils/truncateName";

function useDeleteView() {
	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/view/delete_view",
		},
		{ manual: true },
	);

	const deleteView = async (payload: IDeleteViewPayload): Promise<boolean> => {
		try {
			const response = await trigger({
				data: payload,
			});

			if (response?.data || response?.status === 200) {
				showAlert({
					type: "success",
					message: "View deleted successfully",
				});
				return true;
			}
			return false;
		} catch (error: any) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Failed to delete view"
				}`,
			});
			return false;
		}
	};

	return {
		loading,
		deleteView,
	};
}

export default useDeleteView;

