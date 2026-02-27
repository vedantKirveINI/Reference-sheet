// Hook wrapper for useCreateView - integrates with viewStore
import { useViewStore } from "@/stores/viewStore";
import useCreateViewHook from "@/pages/MainPage/hooks/useCreateView";
import type { ICreateViewPayload } from "@/types/view";

function useCreateView() {
	const { addView } = useViewStore();
	const { createView: createViewAPI, loading } = useCreateViewHook();

	const createView = async (payload: ICreateViewPayload) => {
		const newView = await createViewAPI(payload);
		if (newView) {
			// Update store with new view
			addView(newView);
			return newView;
		}
		return null;
	};

	return {
		loading,
		createView,
	};
}

export default useCreateView;