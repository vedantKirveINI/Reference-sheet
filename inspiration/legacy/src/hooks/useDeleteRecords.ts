import { useCallback } from "react";

import useRequest from "@/hooks/useRequest";

interface DeleteRecordsParams {
	tableId: string;
	baseId: string;
	viewId: string;
	ids: string[];
}

interface DeleteRecordItem {
	__id: number;
	__status: string;
}

interface DeleteRecordsPayload {
	tableId: string;
	baseId: string;
	viewId: string;
	records: DeleteRecordItem[];
}

const DELETE_RECORDS_URL = "/record/update_records_status";

export const useDeleteRecords = () => {
	const [{ loading }, triggerDelete] = useRequest(
		{
			method: "put",
			url: DELETE_RECORDS_URL,
		},
		{ manual: true },
	);

	const deleteRecords = useCallback(
		async ({ tableId, baseId, viewId, ids }: DeleteRecordsParams) => {
			const recordsPayload = ids
				.map((id) => Number(id) || parseInt(id, 10))
				.filter((id) => !Number.isNaN(id))
				.map((id) => ({
					__id: id,
					__status: "inactive",
				}));

			if (!recordsPayload.length) {
				throw new Error("No valid record ids provided for deletion");
			}

			const payload: DeleteRecordsPayload = {
				tableId,
				baseId,
				viewId,
				records: recordsPayload,
			};

			await triggerDelete({ data: payload });
		},
		[triggerDelete],
	);

	return { deleteRecords, loading };
};

export default useDeleteRecords;
