import { showAlert } from "@/lib/toast";
import { useCallback } from "react";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";

function useTables() {
        const { assetId: baseId } = useDecodedUrlParams();

        const [{ data, loading, error }, trigger] = useRequest(
                {
                        method: "get",
                        url: "/table",
                },
                {
                        manual: true,
                },
        );

        const getAllTables = useCallback(
                async (data) => {
                        try {
                                const tablesInfoResponse = await trigger({
                                        params: {
                                                baseId,
                                                is_view_required: true,
                                                ...data,
                                        },
                                });
                                return tablesInfoResponse;
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
                },
                [baseId, trigger],
        );

        return {
                getAllTables,
                tableListData: data,
                loading,
                error,
        };
}

export default useTables;
