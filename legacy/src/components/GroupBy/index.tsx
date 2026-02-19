import { isEmpty } from "lodash";
import { Layers } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React, { useRef, useState, useEffect, useMemo } from "react";

import useGroupBy from "./hooks/useGroupBy.js";
import GroupByContent from "./GroupByContent/index";
import { useModalControlStore } from "@/stores/modalControlStore";
import { ORDER_BY_OPTIONS_MAPPING } from "./constant";
import styles from "./styles.module.scss";
import { GROUP_COLUMN_BG } from "@/theme/grouping";

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

	const mergedGroupBy = useMemo(() => {
		if (groupByModalState.isOpen && groupByModalState.initialGroupBy) {
			const existingGroupObjs = groupBy?.groupObjs || [];
			const initialGroupObjs =
				groupByModalState.initialGroupBy?.groupObjs || [];
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

	useEffect(() => {
		if (groupByModalState.isOpen && !isOpen) {
			setIsOpen(true);
		}
	}, [groupByModalState.isOpen, isOpen]);

	const {
		groupFields: originalGroupFields,
		handleClick,
		loading,
		updatedGroupObjs,
		groupByFieldOptions,
	} = useGroupBy({
		isOpen,
		setIsOpen,
		groupBy: mergedGroupBy,
		fields:
			groupByModalState.fields.length > 0
				? groupByModalState.fields
				: fields,
		setView,
	});

	const groupFields = async (data: any) => {
		await originalGroupFields(data);
		closeGroupByModal();
	};

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

	const handleClose = () => {
		setIsOpen(false);
		closeGroupByModal();
	};

	const hasActiveGrouping = !isEmpty(originalGroupByForActiveState);

	return (
		<>
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
					<Layers
						style={{
							width: "1.125rem",
							height: "1.125rem",
							color: "#000000",
						}}
					/>
				</div>
				<div className={styles.group_by_option_label}>
					{groupByTitle}
				</div>
			</div>

			<Popover open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
				<PopoverTrigger asChild>
					<span style={{ display: "none" }} />
				</PopoverTrigger>
				<PopoverContent
					align="start"
					style={{
						border: "0.047rem solid #CFD8DC",
						marginTop: "0.875rem",
					}}
				>
					<GroupByContent
						updatedGroupObjs={updatedGroupObjs}
						groupByFieldOptions={groupByFieldOptions}
						onClose={handleClose}
						onSave={groupFields}
						loading={loading}
					/>
				</PopoverContent>
			</Popover>
		</>
	);
};

export default GroupByModal;
