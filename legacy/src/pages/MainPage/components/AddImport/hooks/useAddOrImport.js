import { useState } from "react";

import useDecodedUrlParams from "../../../../../hooks/useDecodedUrlParams";
import useTables from "../../../../MainPage/hooks/useTables";

function useAddOrImport() {
	const [cord, setCord] = useState(null);
	const [open, setOpen] = useState("");
	const [source, setSource] = useState("");
	const [selectedTableIdWithViewId, setSelectedTableIdWithViewId] = useState(
		{},
	);

	const { tableId: currentTableId = "", viewId: currentViewId = "" } =
		useDecodedUrlParams();

	const {
		getAllTables = () => {},
		tableListData = [],
		loading: isTableListLoading = false,
	} = useTables();

	const onAddOrImportClick = (e) => {
		const rect = e?.currentTarget?.getBoundingClientRect();

		if (rect?.left && rect?.bottom) {
			setCord({
				left: rect.left,
				top: rect.bottom + 8,
			});

			getAllTables();
		}
	};

	return {
		cord,
		open,
		source,
		selectedTableIdWithViewId,
		setCord,
		setOpen,
		setSource,
		setSelectedTableIdWithViewId,
		onAddOrImportClick,
		isTableListLoading,
		tableListData,
		currentTableId,
		currentViewId,
	};
}

export default useAddOrImport;
