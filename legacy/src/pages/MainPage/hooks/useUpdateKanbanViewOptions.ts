// Hook to update Kanban view options (stackFieldId and isEmptyStackHidden)
import { showAlert } from "@/lib/toast";
import useRequest from "@/hooks/useRequest";
import type { IView } from "@/types/view";
import truncateName from "@/utils/truncateName";
import { useViewStore } from "@/stores/viewStore";

export interface IUpdateKanbanViewOptionsPayload {
	viewId: string;
	tableId: string;
	baseId: string;
	options: {
		stackFieldId: number;
		isEmptyStackHidden: boolean;
	};
}

function useUpdateKanbanViewOptions() {
	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/view/update_view",
		},
		{ manual: true },
	);

	const { updateView } = useViewStore();

	const updateKanbanViewOptions = async (
		payload: IUpdateKanbanViewOptionsPayload,
	): Promise<IView | null> => {
		try {
			const { viewId, tableId, baseId, options } = payload;

			// Build API payload
			const apiPayload = {
				id: viewId,
				tableId,
				baseId,
				options, // Backend expects object, axios will stringify automatically
			};

			const response = await trigger({
				data: apiPayload,
			});

			if (response?.data) {
				const updatedView = response.data as IView;

				// Update viewStore with the updated view
				updateView(viewId, updatedView);

				showAlert({
					type: "success",
					message: "Kanban view updated successfully",
				});

				return updatedView;
			}
			return null;
		} catch (error: any) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Failed to update Kanban view"
				}`,
			});
			return null;
		}
	};

	return {
		loading,
		updateKanbanViewOptions,
	};
}

export default useUpdateKanbanViewOptions;

