import { useCallback } from "react";
import { showAlert } from "@/lib/toast";
import useRequest from "./useRequest";
import useDecodedUrlParams from "./useDecodedUrlParams";
import truncateName from "../utils/truncateName";

interface ColumnMetaUpdate {
	id: number;
	width?: number;
	text_wrap?: string;
	is_hidden?: boolean;
}

function useUpdateColumnMeta() {
	const { tableId, viewId, assetId: baseId } = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "put",
			url: "/view/update_column_meta",
		},
		{ manual: true },
	);

	const updateColumnMeta = useCallback(
		async (updates: ColumnMetaUpdate[]) => {
			try {
				await trigger({
					data: {
						tableId,
						baseId,
						viewId,
						columnMeta: updates.map((update) => ({
							id: update.id,
							// ...(update.width !== undefined && { width: update.width }),
							// ...(update.text_wrap !== undefined && {
							// 	text_wrap: update.text_wrap,
							// }),
							...(update.is_hidden !== undefined && {
								is_hidden: update.is_hidden,
							}),
						})),
					},
				});
				// Socket event will handle the response/UI update
			} catch (error: any) {
				showAlert({
					type: "error",
					message:
						truncateName(error?.response?.data?.message, 50) ||
						"Could not update column metadata",
				});
			}
		},
		[trigger, tableId, baseId, viewId],
	);

	return { updateColumnMeta, loading };
}

export default useUpdateColumnMeta;
