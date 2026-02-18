import { showAlert } from "@/lib/toast";
import { useCallback } from "react";

import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useRequest from "@/hooks/useRequest";
import truncateName from "@/utils/truncateName";

interface DeleteFieldItem {
        id: number;
        status: "inactive";
}

interface DeleteFieldsPayload {
        baseId: string;
        tableId: string;
        viewId: string;
        fields: DeleteFieldItem[];
}

export const useDeleteField = () => {
        const { tableId, assetId: baseId, viewId } = useDecodedUrlParams();

        const [{ loading }, trigger] = useRequest(
                {
                        method: "post",
                        url: "/field/update_fields_status",
                },
                { manual: true },
        );

        const deleteField = useCallback(
                async (fieldIds: (string | number)[]) => {
                        if (!fieldIds.length) {
                                showAlert({
                                        type: "error",
                                        message: "No fields selected for deletion",
                                });
                                return;
                        }

                        // Format fields for API - each field needs id (as number) and status
                        // Convert field IDs to numbers as backend expects z.number()
                        const fields: DeleteFieldItem[] = fieldIds
                                .map((id) => {
                                        const numId = typeof id === "string" ? Number(id) : id;
                                        // Filter out invalid numbers
                                        if (Number.isNaN(numId)) {
                                                return null;
                                        }
                                        return {
                                                id: numId,
                                                status: "inactive" as const,
                                        };
                                })
                                .filter((field): field is DeleteFieldItem => field !== null);

                        if (!fields.length) {
                                showAlert({
                                        type: "error",
                                        message: "No valid field IDs provided for deletion",
                                });
                                return;
                        }

                        const payload: DeleteFieldsPayload = {
                                baseId,
                                tableId,
                                viewId,
                                fields,
                        };

                        try {
                                await trigger({ data: payload });

                                showAlert({
                                        type: "success",
                                        message: "Successfully deleted fields",
                                });
                        } catch (error: any) {
                                showAlert({
                                        type: "error",
                                        message: `${
                                                truncateName(error?.response?.data?.message, 50) ||
                                                "Could not delete fields"
                                        }`,
                                });
                                throw error;
                        }
                },
                [trigger, baseId, tableId, viewId],
        );

        return {
                deleteField,
                loading,
        };
};

export default useDeleteField;
