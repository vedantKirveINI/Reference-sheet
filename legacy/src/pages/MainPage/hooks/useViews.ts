// Hook to fetch views from API
import { useCallback } from "react";
import { showAlert } from "oute-ds-alert";
import useRequest from "@/hooks/useRequest";
import type { IView, IGetViewsPayload } from "@/types/view";
import truncateName from "@/utils/truncateName";

function useViews() {
	const [{ data, loading, error }, trigger] = useRequest(
		{
			method: "post",
			url: "/view/get_views",
		},
		{ manual: true },
	);

	const fetchViews = useCallback(async (payload: IGetViewsPayload): Promise<IView[]> => {
		try {
			const response = await trigger({
				data: payload,
			});

			if (response?.data) {
				return Array.isArray(response.data) ? response.data : [];
			}
			return [];
		} catch (error: any) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Failed to fetch views"
				}`,
			});
			return [];
		}
	}, [trigger]);

	return {
		data: (data?.data || []) as IView[],
		loading,
		error,
		fetchViews,
	};
}

export default useViews;

