import isEmpty from "lodash/isEmpty";
import { showAlert } from "@/lib/toast";
import { useState, useEffect, useMemo } from "react";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";
import { ORDER_BY_OPTIONS_MAPPING, GROUPABLE_FIELD_TYPES } from "../constant";
import { useGroupByPlaygroundStore } from "@/stores/groupByPlaygroundStore";
import { useGridCollapsedGroupStore } from "@/stores/useGridCollapsedGroupStore";

const normalizeFieldId = (id) => {
	return typeof id === "string" ? Number(id) : id;
};

const findFieldOption = (fieldOptions, fieldId) => {
	const normalizedId = normalizeFieldId(fieldId);
	return fieldOptions.find(
		(option) => normalizeFieldId(option.value) === normalizedId,
	);
};

const generateTitle = (groupObjs) => {
	if (isEmpty(groupObjs)) return "Group by";

	const labels = groupObjs.map((obj) => obj.field?.label || "Unknown");

	if (labels.length === 1) {
		return `Grouped by ${labels[0]}`;
	} else if (labels.length === 2) {
		return `Grouped by ${labels[0]}, ${labels[1]}`;
	} else {
		return `Grouped by ${labels[0]} and ${labels.length - 1} others`;
	}
};

function useGroupBy({
	setIsOpen = () => {},
	groupBy = {},
	fields = [],
	setView,
}) {
	const { tableId, viewId, assetId: baseId } = useDecodedUrlParams();
	const { reset: resetPlaygroundStore } = useGroupByPlaygroundStore();
	const { clearCollapsedGroups } = useGridCollapsedGroupStore();

	const [{ loading }, trigger] = useRequest(
		{
			method: "put",
			url: "/view/update_group_by",
		},
		{ manual: true },
	);

	const [groupByState, setGroupByState] = useState(groupBy);

	useEffect(() => {
		const currentKey = JSON.stringify(groupBy?.groupObjs || []);
		const stateKey = JSON.stringify(groupByState?.groupObjs || []);
		if (currentKey !== stateKey) {
			setGroupByState(groupBy);
		}
	}, [groupBy]);

	const groupableFields = useMemo(() => {
		return fields.filter((field) =>
			GROUPABLE_FIELD_TYPES.includes(field?.type),
		);
	}, [fields]);

	const groupByFieldOptions = useMemo(() => {
		return groupableFields.map((field) => ({
			label: field?.name,
			value: field?.id,
			dbFieldName: field?.dbFieldName,
			type: field?.type,
		}));
	}, [groupableFields]);

	const updatedGroupObjs = useMemo(() => {
		const groupObjs = groupByState?.groupObjs || [];

		return groupObjs
			.map((groupObj) => {
				const field = findFieldOption(
					groupByFieldOptions,
					groupObj.fieldId,
				);
				const order = ORDER_BY_OPTIONS_MAPPING.find(
					(option) => option?.value === groupObj?.order,
				);

				return { field, order };
			})
			.filter((obj) => obj.field);
	}, [groupByState, groupByFieldOptions]);

	const groupByTitle = useMemo(() => {
		return generateTitle(updatedGroupObjs);
	}, [updatedGroupObjs]);

	const handleClick = () => {
		setIsOpen((prev) => !prev);
	};

	const groupFields = async (data) => {
		try {
			const response = await trigger({
				data: {
					tableId,
					baseId,
					id: viewId,
					groupBy: { groupObjs: data },
					should_stringify: true,
				},
			});

			const responseData = response?.data || response;
			let updatedGroup = responseData?.group;

			if (updatedGroup === null || updatedGroup === undefined) {
				updatedGroup = null;
			} else if (typeof updatedGroup === "string") {
				try {
					updatedGroup = JSON.parse(updatedGroup);
				} catch {
					updatedGroup = null;
				}
			}

			const normalizedGroup = updatedGroup
				? {
						...updatedGroup,
						groupObjs: Array.isArray(updatedGroup.groupObjs)
							? updatedGroup.groupObjs.map((obj) => ({
									...obj,
									fieldId:
										typeof obj.fieldId === "string"
											? Number(obj.fieldId)
											: obj.fieldId,
								}))
							: [],
					}
				: null;

			setGroupByState(normalizedGroup || { groupObjs: [] });

			if (setView && typeof setView === "function") {
				try {
					setView((prevView) => {
						const prev = prevView || {};
						const newGroup = normalizedGroup
							? {
									...normalizedGroup,
									groupObjs: normalizedGroup.groupObjs
										? [...normalizedGroup.groupObjs]
										: [],
								}
							: null;

						return {
							...prev,
							group: newGroup,
						};
					});
				} catch {
				}
			}

			try {
				const cacheKey = tableId && viewId ? `${tableId}_${viewId}` : null;
				if (cacheKey) {
					clearCollapsedGroups(cacheKey);
				}
			} catch {
			}

			try {
				resetPlaygroundStore();
			} catch {
			}

			try {
				setIsOpen(false);
			} catch {
			}
		} catch (error) {
			if (error?.isCancel) {
				return;
			}

			let errorMessage = "Failed to update group by";
			
			const safeStringify = (value) => {
				if (typeof value === 'string') return value;
				if (value === null || value === undefined) return null;
				try {
					const str = JSON.stringify(value);
					if (str === '{}' || str === 'null' || str.length > 200) {
						if (value && typeof value === 'object') {
							const keys = Object.keys(value);
							if (keys.length > 0) {
								const possibleMessage = value.message || value.error || value.msg || value.description;
								if (possibleMessage && typeof possibleMessage === 'string') {
									return possibleMessage;
								}
								return `Error: ${keys.slice(0, 3).join(', ')}`;
							}
						}
					}
					return str;
				} catch (e) {
					return String(value);
				}
			};

			if (error?.response?.data?.message) {
				errorMessage = safeStringify(error.response.data.message);
			} else if (error?.response?.data) {
				errorMessage = safeStringify(error.response.data);
			} else if (error?.message) {
				errorMessage = safeStringify(error.message);
			} else if (error) {
				const errorStr = safeStringify(error);
				if (errorStr && !errorStr.includes('[object Object]')) {
					errorMessage = errorStr;
				} else {
					if (error && typeof error === 'object') {
						const errorKeys = Object.keys(error);
						if (errorKeys.length > 0) {
							const msg = error.message || error.error || error.msg || error.description || error.reason;
							if (msg && typeof msg === 'string') {
								errorMessage = msg;
							} else {
								errorMessage = `Error occurred: ${errorKeys.slice(0, 2).join(', ')}`;
							}
						}
					}
				}
			}

			showAlert({
				type: "error",
				message: truncateName(errorMessage) || "Could not apply Group By",
			});
		}
	};

	return {
		groupFields,
		handleClick,
		loading,
		groupByTitle,
		updatedGroupObjs,
		groupByFieldOptions,
	};
}

export default useGroupBy;
