// Hook to rename a view
import { showAlert } from "@/lib/toast";
import useRequest from "@/hooks/useRequest";
import type { IView, IRenameViewPayload } from "@/types/view";
import truncateName from "@/utils/truncateName";

function useRenameView() {
        const [{ loading }, trigger] = useRequest(
                {
                        method: "post",
                        url: "/view/update_view",
                },
                { manual: true },
        );

        const renameView = async (
                payload: IRenameViewPayload,
        ): Promise<IView | null> => {
                try {
                        const response = await trigger({
                                data: payload,
                        });

                        if (response?.data) {
                                showAlert({
                                        type: "success",
                                        message: "View renamed successfully",
                                });
                                return response.data as IView;
                        }
                        return null;
                } catch (error: any) {
                        showAlert({
                                type: "error",
                                message: `${
                                        truncateName(error?.response?.data?.message, 50) ||
                                        "Failed to rename view"
                                }`,
                        });
                        return null;
                }
        };

        return {
                loading,
                renameView,
        };
}

export default useRenameView;

