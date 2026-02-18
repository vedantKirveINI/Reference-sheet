import { showAlert } from "@/lib/toast";

import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

function useSearchUsersSdk() {
        const [{ data, loading }, getUsersTrigger] = useRequest(
                {
                        method: "get",
                        url: "/user-sdk/search?",
                },
                { manual: true },
        );

        const getUsers = async (query = "") => {
                try {
                        const response = await getUsersTrigger({
                                params: {
                                        q: query,
                                        page: 1,
                                        limit: 10,
                                },
                        });

                        const { data = {} } = response || {};
                        return data;
                } catch (error) {
                        const { isCancel } = error || {};

                        if (isCancel) return;

                        showAlert({
                                type: "error",
                                message: `${
                                        truncateName(error?.response?.data?.message, 50) ||
                                        "Something went wrong"
                                }`,
                        });
                }
        };

        return {
                data,
                loading,
                getUsers,
        };
}

export default useSearchUsersSdk;
