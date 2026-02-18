import { isEmpty } from "lodash";
import ODSIcon from "@/lib/oute-icon";
import React, { useRef, useState, useEffect, useMemo } from "react";

import useGroupBy from "./hooks/useGroupBy.js";
import GroupByContent from "./GroupByContent/index";
import { useModalControlStore } from "@/stores/modalControlStore";
import { ORDER_BY_OPTIONS_MAPPING } from "./constant";
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
	const popoverRef = useRef<HTMLDivElement | null>(null);
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

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				groupByRef.current &&
				!groupByRef.current.contains(e.target as Node)
			) {
				handleClose();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<>
			<div
				className={`flex items-center cursor-pointer py-1 px-2 rounded-md transition-colors duration-200 hover:bg-[#eceff1] ${hasActiveGrouping ? "font-medium" : ""}`}
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
				<div className="flex items-center">
					<ODSIcon
						outeIconName="OUTEGroup"
						outeIconProps={{
							className: "w-[1.125rem] h-[1.125rem] text-black",
						}}
					/>
				</div>
				<div className="text-sm text-black whitespace-nowrap">
					{groupByTitle}
				</div>
			</div>

			{isOpen && (
				<div
					ref={popoverRef}
					className="fixed z-[200] mt-3.5 border border-[#CFD8DC] bg-white rounded-lg shadow-lg"
					style={{
						top: groupByRef.current
							? groupByRef.current.getBoundingClientRect().bottom
							: 0,
						left: groupByRef.current
							? groupByRef.current.getBoundingClientRect().left
							: 0,
					}}
				>
					<GroupByContent
						updatedGroupObjs={updatedGroupObjs}
						groupByFieldOptions={groupByFieldOptions}
						onClose={handleClose}
						onSave={groupFields}
						loading={loading}
					/>
				</div>
			)}
		</>
	);
};

export default GroupByModal;
