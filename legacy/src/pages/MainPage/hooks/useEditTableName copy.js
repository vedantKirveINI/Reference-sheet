import { showAlert } from "oute-ds-alert";
import { useCallback, useEffect } from "react";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";

const formatTableName = (name) => {
	const parser = new DOMParser();
	const doc = parser.parseFromString(name, "text/html");
	return doc.documentElement.textContent;
};

const updateTableState = ({
	setTableList = () => {},
	currentTable = {},
	tableName = "",
}) => {
	setTableList((prev) => {
		return (prev || []).map((table) =>
			table?.id === currentTable?.id
				? { ...table, name: tableName }
				: table,
		);
	});
};

function useEditTableName({ table = {}, ref, setTableList = () => {} }) {
	const { assetId } = useDecodedUrlParams();

	const [{}, trigger] = useRequest(
		{
			method: "put",
			url: "/table/update_table",
		},
		{
			manual: true,
		},
	);

	const updatedTableName = useCallback(
		async (data) => {
			try {
				await trigger({
					data: { ...data, baseId: assetId },
				});

				showAlert({
					type: "success",
					message: "Table name updated successfully",
				});
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

				ref.current.innerText = table?.name;

				updateTableState({
					setTableList,
					currentTable: table,
					tableName: table?.name,
				});
			}
		},
		[trigger],
	);

	const handleClickOutside = useCallback(
		(event) => {
			if (ref.current && !ref.current.contains(event.target)) {
				ref.current.blur();
			}
		},
		[ref],
	);

	const saveTableName = useCallback(
		(name) => {
			const newTableName = name?.trim()
				? formatTableName(name)
				: "Untitled Table";

			ref.current.innerText = newTableName;

			if (newTableName === table?.name) return;

			updateTableState({
				setTableList,
				currentTable: table,
				tableName: newTableName,
			});
			updatedTableName({ id: table?.id, name: newTableName });
		},
		[ref, table, setTableList, updatedTableName],
	);

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, [handleClickOutside, saveTableName]); //  No unnecessary dependencies

	return {
		updatedTableName,
		saveTableName,
	};
}

export default useEditTableName;
