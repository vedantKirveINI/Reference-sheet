import { showAlert } from "oute-ds-alert";
import { useEffect, useRef, useState, useCallback } from "react";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";
import useDeleteData from "../../Handsontable/hooks/useDeleteData";

const useTabBar = ({
	tableList = [],
	handleTabClick = () => {},
	setShowLeftArrow = () => {},
	setShowRightArrow = () => {},
	tabListRef = {},
}) => {
	const [tableContextMenu, setTableContextMenu] = useState("");

	const activeTabRef = useRef(null);

	const { tableId, assetId } = useDecodedUrlParams();

	const { deleteRecord: clearTable, loading: clearTableLoading } =
		useDeleteData();

	const [{ loading }, trigger] = useRequest(
		{
			method: "put",
			url: "/table/update_tables",
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
		let prevTableData = tableList[0];

		if (prevTableData?.id === tableId) {
			prevTableData = tableList[1];
		}

		handleTabClick({ tableInfo: prevTableData, isReplace: true });
	};

	const onSubmit = async () => {
		if (tableContextMenu === "clearData") {
			await clearTable({});
			return;
		}
		await deleteTable();
	};

	const checkScroll = useCallback(() => {
		if (!tabListRef.current) return;

		const { scrollLeft, scrollWidth, clientWidth } = tabListRef.current;

		setShowLeftArrow(scrollLeft > 0);
		setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
	}, [setShowLeftArrow, setShowRightArrow, tabListRef]);

	useEffect(() => {
		if (tableContextMenu === "renameTable") {
			activeTabRef.current?.focus();

			const range = document.createRange();
			range.selectNodeContents(activeTabRef.current);

			const selection = window.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);

			setTableContextMenu(null);
		}
	}, [setTableContextMenu, tableContextMenu]);

	return {
		tableContextMenu,
		setTableContextMenu,
		onSubmit,
		loading: loading || clearTableLoading,
		activeTabRef,
		checkScroll,
	};
};

export default useTabBar;
