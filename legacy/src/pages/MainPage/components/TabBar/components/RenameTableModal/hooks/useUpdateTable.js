import { showAlert } from "@/lib/toast";
import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

function useUpdateTable({ baseId, tableId }) {
	const [{ loading }, trigger] = useRequest(
		{
			method: "put",
			url: "/table/update_table",
		},
		{ manual: true },
	);

	const updateTable = async (data) => {
		try {
			await trigger({
				data: {
					baseId,
					id: tableId,
					name: data.name,
				},
			});

			showAlert({
				type: "success",
				message: "Table name updated successfully",
			});

			return { success: true };
		} catch (error) {
			showAlert({
				type: "error",
				message:
					truncateName(error?.response?.data?.message) ||
					"Could not update table name",
			});
			throw error;
		}
	};

	return {
		updateTable,
		loading,
	};
}

export default useUpdateTable;
