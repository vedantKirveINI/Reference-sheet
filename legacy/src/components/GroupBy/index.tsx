import { isEmpty } from "lodash";
import Icon from "oute-ds-icon";
import Popover from "oute-ds-popover";
import React, { useRef, useState, useEffect, useMemo } from "react";

import useGroupBy from "./hooks/useGroupBy.js";
import GroupByContent from "./GroupByContent/index";
import { useModalControlStore } from "@/stores/modalControlStore";
import { ORDER_BY_OPTIONS_MAPPING } from "./constant";
import styles from "./styles.module.scss";
import { GROUP_COLUMN_BG } from "@/theme/grouping";

// ============================================
// TYPES
// ============================================
interface GroupByFieldDefinition {
	id: string | number;
	name: string;
	dbFieldName?: string;
	type?: string;
}

interface GroupByConfig {
	groupObjs?: Array<{
		fieldId?: string | number;
		order?: string;
		dbFieldName?: string;
		type?: string;
	}>;
}

interface GroupByModalProps {
	groupBy?: GroupByConfig;
	fields?: GroupByFieldDefinition[];
	setView: (view: Record<string, unknown>) => void;
}

// ============================================
// COMPONENT
// ============================================
const GroupByModal: React.FC<GroupByModalProps> = ({
	groupBy = { groupObjs: [] },
	fields = [],
	setView,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const groupByRef = useRef<HTMLDivElement | null>(null);
	const groupByModalState = useModalControlStore(
		(state) => state.groupByModalState,
	);
	const closeGroupByModal = useModalControlStore(
		(state) => state.closeGroupByModal,
	);

	// Merge store initial groupBy with prop groupBy
	const mergedGroupBy = useMemo(() => {
		if (groupByModalState.isOpen && groupByModalState.initialGroupBy) {
			// initialGroupBy from store is already in API format
			// Merge with existing groupBy (also in API format)
			const existingGroupObjs = groupBy?.groupObjs || [];
			const initialGroupObjs =
				groupByModalState.initialGroupBy?.groupObjs || [];
			// Combine and deduplicate by fieldId
			const combined = [...existingGroupObjs, ...initialGroupObjs];
			const unique = combined.filter(
				(item, index, self) =>
					index ===
					self.findIndex(
						(t) =>
							String(t.fieldId || t.field?.value) ===
							String(item.fieldId || item.field?.value),
					),
			);
			return {
				groupObjs: unique,
			};
		}
		return groupBy;
	}, [groupBy, groupByModalState.isOpen, groupByModalState.initialGroupBy]);

	// Open modal when store state changes
	useEffect(() => {
		if (groupByModalState.isOpen && !isOpen) {
			setIsOpen(true);
		}
	}, [groupByModalState.isOpen, isOpen]);

	// Use merged groupBy ONLY for modal content (form inside modal)
	const {
		groupFields: originalGroupFields,
		handleClick,
		loading,
		updatedGroupObjs,
		groupByFieldOptions,
	} = useGroupBy({
		isOpen,
		setIsOpen,
		groupBy: mergedGroupBy, // Use merged groupBy for modal content only
		fields:
			groupByModalState.fields.length > 0
				? groupByModalState.fields
				: fields,
		setView,
	});

	// Wrap groupFields to also close the modal store state after save
	const groupFields = async (data: any) => {
		await originalGroupFields(data);
		// After successful save, also reset the store state
		closeGroupByModal();
	};

	// Use original groupBy (from view) for title and active state - only show what's actually saved
	// This prevents showing pre-filled values in title/active state before save
	const originalGroupByForActiveState = useMemo(() => {
		const groupObjs = groupBy?.groupObjs || [];
		const fieldOptions = fields.map((f) => ({
			label: f?.name,
			value: f?.id,
			dbFieldName: f?.dbFieldName,
			type: f?.type,
		}));

		return groupObjs
			.map((groupObj) => {
				const field = fieldOptions.find(
					(option) => option?.value === groupObj?.fieldId,
				);
				const order = ORDER_BY_OPTIONS_MAPPING.find(
					(option) => option?.value === groupObj?.order,
				);
				return { field, order };
			})
			.filter((obj) => obj.field);
	}, [groupBy, fields]);

	// Compute title from original groupBy (what's actually saved)
	const groupByTitle = useMemo(() => {
		if (isEmpty(originalGroupByForActiveState)) {
			return "Group by";
		}

		let title = "";

		for (let i = 0; i < originalGroupByForActiveState.length; i++) {
			const { field = {} } = originalGroupByForActiveState[i] || {};

			if (i > 2) {
				const firstField = originalGroupByForActiveState[0]?.field;
				const remainingFieldLength =
					originalGroupByForActiveState.length - 1;

				title = `Grouped by ${firstField?.label} and ${remainingFieldLength} others`;
				break;
			}

			if (i === 0) {
				title = `Grouped by ${field?.label}`;
			} else {
				title += `, ${field?.label}`;
			}
		}

		return title;
	}, [originalGroupByForActiveState]);

	// Handle modal close - reset store state
	const handleClose = () => {
		setIsOpen(false);
		closeGroupByModal();
	};

	const hasActiveGrouping = !isEmpty(originalGroupByForActiveState);

	return (
		<>
			{/* Group By Button */}
			<div
				className={`${styles.group_by_option} ${
					hasActiveGrouping && !GROUP_COLUMN_BG
						? styles.group_by_view_highlighted
						: ""
				}`}
				style={
					hasActiveGrouping
						? {
								backgroundColor: GROUP_COLUMN_BG,
								border: "1.5px solid #a78bfa",
							}
						: undefined
				}
				onClick={handleClick}
				ref={groupByRef}
				data-testid="group-by-option"
			>
				<div className={styles.group_by_option_icon}>
					<Icon
						outeIconName="OUTEGroup"
						outeIconProps={{
							sx: {
								width: "1.125rem",
								height: "1.125rem",
								color: "#000000", // Always black to match Sort and Filter
							},
						}}
					/>
				</div>
				<div className={styles.group_by_option_label}>
					{groupByTitle}
				</div>
			</div>

			{/* Group By Popover */}
			<Popover
				open={isOpen}
				anchorEl={groupByRef?.current}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
				placement="bottom-start"
				onClose={handleClose}
				sx={{ zIndex: 200 }}
				slotProps={{
					paper: {
						sx: {
							border: "0.047rem solid #CFD8DC",
							marginTop: "0.875rem",
						},
					},
				}}
			>
				<GroupByContent
					updatedGroupObjs={updatedGroupObjs}
					groupByFieldOptions={groupByFieldOptions}
					onClose={handleClose}
					onSave={groupFields}
					loading={loading}
				/>
			</Popover>
		</>
	);
};

export default GroupByModal;
