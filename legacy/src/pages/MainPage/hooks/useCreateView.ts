// Hook to create a new view
import { showAlert } from "@/lib/toast";
import useRequest from "@/hooks/useRequest";
import type { IView, ICreateViewPayload } from "@/types/view";
import truncateName from "@/utils/truncateName";

function useCreateView() {
	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/view/create_view",
		},
		{ manual: true },
	);

	const createView = async (
		payload: ICreateViewPayload,
	): Promise<IView | null> => {
		try {
			const response = await trigger({
				data: payload,
			});

			if (response?.data) {
				showAlert({
					type: "success",
					message: "View created successfully",
				});
				return response.data as IView;
			}
			return null;
		} catch (error: any) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Failed to create view"
				}`,
			});
			return null;
		}
	};

	return {
		loading,
		createView,
	};
}

export default useCreateView;

