import { showAlert } from "@/lib/toast";

import useRequest from "@/hooks/useRequest";

function useGetMembers() {
	const [{ data, loading, error }, getMembersTrigger] = useRequest(
		{
			method: "get",
			url: "/asset/get_members",
		},
		{ manual: true },
	);

	const getMembers = async (baseId) => {
		try {
			const response = await getMembersTrigger({
				params: {
					asset_id: baseId,
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
		getMembers,
		data,
		loading,
		error,
	};
}

export default useGetMembers;
