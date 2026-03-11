import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";
import { useMemo } from "react";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";
import { ORDER_BY_OPTIONS_MAPPING } from "../constant";

function useSort({ setIsOpen = () => {}, sort = [], fields = [] }) {
	const { tableId, viewId, assetId: baseId } = useDecodedUrlParams();

	const [{ loading }, trigger] = useRequest(
		{
			method: "put",
			url: "/view/update_sort",
		},
		{ manual: true },
	);

	const sortFieldOptions = useMemo(() => {
		return (fields || []).map((field) => ({
			label: field?.name,
			value: field?.id,
			dbFieldName: field?.dbFieldName,
			type: field?.type,
		}));
	}, [fields]);

	const updatedSortObjs = useMemo(() => {
		const sortObjs = sort?.sortObjs || [];

		return (sortObjs || [])
			.map((field) => ({
				field: sortFieldOptions.find(
					(option) => option?.value === field?.fieldId,
				),
				order: ORDER_BY_OPTIONS_MAPPING.find(
					(option) => option?.value === field?.order,
				),
			}))
			.filter((sortObj) => sortObj?.field);
	}, [sort, sortFieldOptions]);

	const sortFields = async (data) => {
		try {
			await trigger({
				data: {
					tableId,
					baseId,
					id: viewId,
					sort: { sortObjs: data, manualSort: false },
					should_stringify: true,
				},
			});
			setIsOpen(false);
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message) ||
					"Could not apply Sort"
				}`,
			});
		}
	};

	const handleClick = async () => {
		setIsOpen((prev) => !prev);
	};

	const getSortTitle = () => {
		if (isEmpty(updatedSortObjs)) {
			return "Sort";
		}

		let sortTitle = "";

		for (let i = 0; i < updatedSortObjs.length; i++) {
			const { field = {} } = updatedSortObjs[i] || {};

			if (i > 2) {
				const firstField = updatedSortObjs[0]?.field;
				const remainingFieldLength = updatedSortObjs.length - 1;

				sortTitle = `Sorted by ${firstField?.label} and ${remainingFieldLength} others`;
				break;
			}

			if (i === 0) {
				sortTitle = `Sorted by ${field?.label}`;
			} else {
				sortTitle += `, ${field?.label}`;
			}
		}

		return sortTitle;
	};

	return {
		sortFields,
		handleClick,
		loading,
		getSortTitle,
		updatedSortObjs,
		sortFieldOptions,
	};
}

export default useSort;
