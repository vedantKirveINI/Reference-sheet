import isEmpty from "lodash/isEmpty";
import { useState } from "react";

import useClearField from "../../Handsontable/hooks/useClearField";
import useDeleteData from "../../Handsontable/hooks/useDeleteData";
import useDeleteField from "../../Handsontable/hooks/useDeleteField";
import { setPermissionMeta } from "../../Handsontable/utils/permissionMeta";

const getDialogConfig = ({ deleteFieldIds, clearFieldIds, deleteRowIds }) => {
	if (!isEmpty(deleteFieldIds)) {
		const isMultipleField = deleteFieldIds?.length > 1;

		return {
			iconName: "OUTETrashIcon",
			title: "Delete Field",
			footerLabel: "DELETE",
			showCheckbox: false,
			content: `Are you sure you want to delete the selected field${isMultipleField ? "s" : ""}?`,
		};
	}

	if (!isEmpty(clearFieldIds)) {
		const isMultipleField = clearFieldIds?.length > 1;
		return {
			iconName: "OUTECloseIcon",
			title: "Clear Field",
			footerLabel: "CLEAR",
			showCheckbox: false,
			content: `Are you sure you want to clear the selected field${isMultipleField ? "s" : ""}?`,
		};
	}

	if (!isEmpty(deleteRowIds)) {
		const isMultipleRow = deleteRowIds?.length > 1;
		return {
			iconName: "OUTETrashIcon",
			title: `Delete Row${isMultipleRow ? "s" : ""}`,
			footerLabel: "DELETE",
			showCheckbox: true,
			content: `Are you sure you want to delete the selected row${isMultipleRow ? "s" : ""}?`,
		};
	}

	return { title: "", footerLabel: "", showCheckbox: false, content: "" };
};

const useDeleteHandler = ({
	setIsDeleteFieldOpen = () => {},
	isDeleteFieldOpen = {},
}) => {
	const [isDontAskChecked, setIsDontAskChecked] = useState(false);

	const { loading: deleteFieldLoading, deleteField } = useDeleteField({
		setIsDeleteFieldOpen,
	});
	const { loading: clearFieldLoading, clearField } = useClearField({
		setIsDeleteFieldOpen,
	});

	const { loading: deleteRecordLoading, deleteRecord } = useDeleteData();

	const {
		deleteFieldIds = [],
		clearFieldIds = [],
		deleteRowIds = [],
		checkedRowsRef,
	} = isDeleteFieldOpen;

	const dialogConfig = getDialogConfig({
		deleteFieldIds,
		clearFieldIds,
		deleteRowIds,
	});

	const handleDeleteRecords = async () => {
		await deleteRecord({ deleteRowIds });
		checkedRowsRef.current.selectedRow = {};
		checkedRowsRef.current.checkedRowsMap.clear();
		setPermissionMeta({
			permissionMeta: { record_dont_ask: isDontAskChecked },
		});
		setIsDeleteFieldOpen(false);
	};

	const handleSave = () => {
		if (!isEmpty(deleteFieldIds)) {
			deleteField(deleteFieldIds);
			checkedRowsRef.current?.selectedColumnsMap?.clear();
			return;
		}

		if (!isEmpty(clearFieldIds)) {
			checkedRowsRef.current?.selectedColumnsMap?.clear();
			clearField(clearFieldIds);
			return;
		}

		if (!isEmpty(deleteRowIds)) {
			handleDeleteRecords();
			return;
		}
	};

	return {
		dialogConfig,
		handleSave,
		isDontAskChecked,
		setIsDontAskChecked,
		loading: deleteFieldLoading || clearFieldLoading || deleteRecordLoading,
	};
};

export default useDeleteHandler;
