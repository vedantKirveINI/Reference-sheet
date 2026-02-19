import { showAlert } from "oute-ds-alert";
import { useRef, useCallback } from "react";
import truncateName from "../../../utils/truncateName";
import useRequest from "../../../hooks/useRequest";

function useExportData({
	viewId = "",
	tableId = "",
	baseId = "",
	tableListData = [],
}) {
	const exportDataRef = useRef(null);

	const [{}, trigger] = useRequest(
		{
			method: "post",
			url: "/table/export_data_to_csv",
		},
		{ manual: true },
	);

	const onClick = useCallback(async () => {
		try {
			const response = await trigger({
				data: {
					viewId,
					baseId,
					tableId,
				},
			});

			// Create a blob URL and trigger a download
			const blob = new Blob([response.data], { type: "text/csv" });

			const activeTable = tableListData.find(
				(table) => table.id === tableId,
			);

			const currentDate = new Date();
			const formattedDate = currentDate
				.toISOString()
				.slice(0, 19)
				.replace("T", "_")
				.replace(/:/g, "-");

			// Create a readable CSV name with the table name and formatted date
			const tableName =
				activeTable?.name?.replace(/\s+/g, "_") || "ExportedData";
			const csvName = `${tableName}_${formattedDate}.csv`;

			const downloadUrl = window.URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = downloadUrl;
			link.download = csvName;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			window.URL.revokeObjectURL(downloadUrl);

			showAlert({
				type: "success",
				message: "File Download Successfully",
			});
		} catch (error) {
			const { isCancel } = error || {};

			if (isCancel) return;

			showAlert({
				type: "error",
				message: `${truncateName(error?.response?.data?.message, 50) || "Something went wrong"}`,
			});
		}
	}, [trigger, viewId, baseId, tableId, tableListData]);

	return {
		exportDataRef,
		onClick,
	};
}

export default useExportData;
