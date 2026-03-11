
import { showAlert } from "oute-ds-alert";

import useRequest from "@/hooks/useRequest";

function useSharePermission() {
	const [{ data, loading, error }, sharePermissionTrigger] = useRequest(
		{
			method: "post",
			url: "/asset/share",
		},
		{
			manual: true,
		},
	);

	const sharePermission = async (payload) => {
		try {
			const response = await sharePermissionTrigger({
				data: payload,
			});

			const { status, result } = response?.data || {};

			showAlert({
				type: status === "success" ? "success" : "error",
				message: result?.message,
			});
		} catch (error) {
			const { isCancel } = error || {};

			if (isCancel) return;

			showAlert({
				type: "error",
				message: `${
					error?.response?.data?.message || "Could not share access"
				}`,
			});
		}
	};

	return {
		sharePermission,
		data,
		loading,
		error,
	};
}

export default useSharePermission;
