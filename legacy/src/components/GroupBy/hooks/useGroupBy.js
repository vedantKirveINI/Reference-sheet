import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";
import { useState, useEffect, useMemo } from "react";

import useDecodedUrlParams from "../../../hooks/useDecodedUrlParams";
import useRequest from "../../../hooks/useRequest";
import truncateName from "../../../utils/truncateName";
import { ORDER_BY_OPTIONS_MAPPING, GROUPABLE_FIELD_TYPES } from "../constant";
import { useGroupByPlaygroundStore } from "@/stores/groupByPlaygroundStore";
import { useGridCollapsedGroupStore } from "@/stores/useGridCollapsedGroupStore";

// Helper: Normalize field ID to number for consistent comparison
const normalizeFieldId = (id) => {
	return typeof id === "string" ? Number(id) : id;
};

// Helper: Find field option by ID
const findFieldOption = (fieldOptions, fieldId) => {
	const normalizedId = normalizeFieldId(fieldId);
	return fieldOptions.find(
		(option) => normalizeFieldId(option.value) === normalizedId,
	);
};

// Helper: Generate title from grouped fields
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
	// ============================================
	// HOOKS & SETUP
	// ============================================
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

	// ============================================
	// STATE MANAGEMENT
	// ============================================
	const [groupByState, setGroupByState] = useState(groupBy);

	// Sync state when prop changes (compare by content, not reference)
	useEffect(() => {
		const currentKey = JSON.stringify(groupBy?.groupObjs || []);
		const stateKey = JSON.stringify(groupByState?.groupObjs || []);
		if (currentKey !== stateKey) {
			setGroupByState(groupBy);
		}
	}, [groupBy]);

	// ============================================
	// FIELD PROCESSING
	// ============================================
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

	// ============================================
	// DATA TRANSFORMATION
	// ============================================
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
			.filter((obj) => obj.field); // Only keep objects with valid fields
	}, [groupByState, groupByFieldOptions]);

	// ============================================
	// COMPUTED VALUES
	// ============================================
	const groupByTitle = useMemo(() => {
		return generateTitle(updatedGroupObjs);
	}, [updatedGroupObjs]);

	// ============================================
	// EVENT HANDLERS
	// ============================================
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

			// Extract group data from API response
			// Response structure from axios: response.data contains the actual data
			// The API returns: { id, group: { groupObjs: [...] }, ...otherViewFields }
			const responseData = response?.data || response;
			let updatedGroup = responseData?.group;

			// Handle case where group might be null, undefined, or JSON string
			if (updatedGroup === null || updatedGroup === undefined) {
				// Empty groupBy - set to null
				updatedGroup = null;
			} else if (typeof updatedGroup === "string") {
				try {
					updatedGroup = JSON.parse(updatedGroup);
				} catch {
					updatedGroup = null;
				}
			}

			// Normalize fieldIds to numbers for consistency
			// CRITICAL: Create completely new references at every level
			// This ensures React detects changes and memo dependencies recalculate
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

			// Update local state
			setGroupByState(normalizedGroup || { groupObjs: [] });

			// Update view state if setView is provided
			// CRITICAL: Create completely new references to ensure React detects changes
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
					// Don't throw - continue with other operations
				}
			}

			// Clear collapsed groups to ensure all groups start expanded by default
			// Generate cache key using tableId and viewId (same as GridView)
			try {
				const cacheKey = tableId && viewId ? `${tableId}_${viewId}` : null;
				if (cacheKey) {
					clearCollapsedGroups(cacheKey);
				}
			} catch {
				// Don't throw - continue with other operations
			}

			try {
				resetPlaygroundStore();
			} catch {
				// Don't throw - continue with other operations
			}

			try {
				setIsOpen(false);
			} catch {
				// Don't throw - continue
			}
		} catch (error) {
			// Handle cancellation errors first - don't show error toast for cancelled requests
			if (error?.isCancel) {
				return; // Silently return, don't show error
			}

			// Handle different error types (axios errors, network errors, etc.)
			// Extract error message, handling cases where it might be an object
			let errorMessage = "Failed to update group by";
			
			// Helper function to safely convert to string
			const safeStringify = (value) => {
				if (typeof value === 'string') return value;
				if (value === null || value === undefined) return null;
				try {
					const str = JSON.stringify(value);
					// If stringified result is too long or just [object Object], try to extract useful info
					if (str === '{}' || str === 'null' || str.length > 200) {
						// Try to extract meaningful properties
						if (value && typeof value === 'object') {
							const keys = Object.keys(value);
							if (keys.length > 0) {
								// Try to get a meaningful message from common error properties
								const possibleMessage = value.message || value.error || value.msg || value.description;
								if (possibleMessage && typeof possibleMessage === 'string') {
									return possibleMessage;
								}
								// Return a summary of the object
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
				// Check if toString() gave us [object Object]
				if (errorStr && !errorStr.includes('[object Object]')) {
					errorMessage = errorStr;
				} else {
					// Try to extract useful info from error object
					if (error && typeof error === 'object') {
						const errorKeys = Object.keys(error);
						if (errorKeys.length > 0) {
							// Try common error message properties
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

	// ============================================
	// RETURN
	// ============================================
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
