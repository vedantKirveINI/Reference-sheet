import { showAlert } from "@/lib/toast";
import { useEffect, useRef, useState, useCallback } from "react";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";
// import useDeleteData from "../../Handsontable/hooks/useDeleteData";

const useTabBar = ({
        tableList = [],
        handleTabClick = () => {},
        setShowLeftArrow = () => {},
        setShowRightArrow = () => {},
        tabListRef = {},
}) => {
        const [tableContextMenu, setTableContextMenu] = useState("");

        const { tableId, assetId } = useDecodedUrlParams();

        // const { deleteRecord: clearTable, loading: clearTableLoading } =
        //      useDeleteData();

        const [{ loading }, trigger] = useRequest(
                {
                        method: "put",
                        url: "/table/update_tables",
                },
                { manual: true },
        );

        const [{ loading: renameLoading }, renameTrigger] = useRequest(
                {
                        method: "put",
                        url: "/table/update_table",
                },
                { manual: true },
        );

        const deleteTable = async () => {
                try {
                        await trigger({
                                data: {
                                        baseId: assetId,
                                        whereObj: {
                                                id: [tableId],
                                        },
                                        status: "inactive",
                                },
                        });

                        onDeletedTableSuccess();

                        setTableContextMenu("");
                        showAlert({
                                type: "success",
                                message: "Table deleted successfully",
                        });
                } catch (error) {
                        showAlert({
                                type: "error",
                                message: `${
                                        truncateName(error?.response?.data?.message) ||
                                        "Could not delete table"
                                }`,
                        });
                }
        };

        const onDeletedTableSuccess = async () => {
                const remaining = tableList.filter((t) => t.id !== tableId);
                if (remaining.length === 0) return;

                const deletedIndex = tableList.findIndex((t) => t.id === tableId);
                // Select the previous table (to the left); if we deleted the first, select the next one
                const nextTable =
                        deletedIndex > 0 ? remaining[deletedIndex - 1] : remaining[0];

                handleTabClick({ tableInfo: nextTable, isReplace: true });
        };

        const renameTable = async (tableId, tableName) => {
                try {
                        await renameTrigger({
                                data: {
                                        baseId: assetId,
                                        id: tableId,
                                        name: tableName,
                                },
                        });

                        showAlert({
                                type: "success",
                                message: "Table name updated successfully",
                        });
                } catch (error) {
                        showAlert({
                                type: "error",
                                message: `${
                                        truncateName(error?.response?.data?.message) ||
                                        "Could not update table name"
                                }`,
                        });
                        throw error; // Re-throw to allow component to handle
                }
        };

        const onSubmit = async () => {
                if (tableContextMenu === "clearData") {
                        // await clearTable({});
                        return;
                }
                await deleteTable();
        };

        const checkScroll = useCallback(() => {
                if (!tabListRef?.current) return;

                const element = tabListRef.current;
                const { scrollLeft, scrollWidth, clientWidth } = element;

                // Show left arrow if scrolled right (not at leftmost)
                const isAtLeft = scrollLeft <= 2; // At or near leftmost position (slightly increased threshold)
                setShowLeftArrow(!isAtLeft);
                
                // Show right arrow if there's more content to scroll (not at rightmost)
                // Use more precise calculation to detect rightmost position
                const maxScroll = scrollWidth - clientWidth;
                const isAtRight = Math.abs(scrollLeft - maxScroll) <= 2; // At or near rightmost position (within 2px)
                setShowRightArrow(!isAtRight);
        }, [setShowLeftArrow, setShowRightArrow]);

        return {
                tableContextMenu,
                setTableContextMenu,
                onSubmit,
                loading: loading,
                renameTable,
                renameLoading,
                checkScroll,
        };
};

export default useTabBar;
