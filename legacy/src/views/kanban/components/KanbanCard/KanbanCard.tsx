import React, { useMemo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import isEmpty from "lodash/isEmpty";
import { useKanban } from "../../hooks/useKanban";
import { CellDisplay } from "../CellDisplay";
import type { IStackData } from "@/types/kanban";
import type { IRecord } from "@/types";

interface KanbanCardProps {
	record: IRecord;
	stack: IStackData;
	index: number;
}

// Helper to check if a cell value is empty
const isEmptyValue = (cell: any): boolean => {
	if (isEmpty(cell)) return true;

	// Check data
	const data = cell.data;

	if (typeof data === "number") {
		return Number.isNaN(data); // treat NaN as empty
	}

	// Use lodash isEmpty for primitive values, arrays, and empty objects
	if (isEmpty(data)) return true;

	// For objects with keys, check if all values are empty
	if (typeof data === "object" && data !== null && !Array.isArray(data)) {
		const keys = Object.keys(data);
		if (keys.length === 0) return true;

		// Check if all values in the object are empty
		return keys.every((key) => {
			const value = data[key];
			// Recursively check if the value is empty
			if (value == null) return true;
			if (value === "") return true;
			if (Array.isArray(value) && value.length === 0) return true;
			if (typeof value === "object" && isEmpty(value)) return true;

			return false;
		});
	}

	return false;
};

// Helper to format cell value for display (for title)
const formatCellValue = (cell: any): string => {
	if (!cell) return "";

	// Use displayData if available (formatted string)
	if (cell.displayData) {
		return String(cell.displayData);
	}

	// Otherwise format data
	const data = cell.data;
	if (data == null) return "";

	// Handle arrays (for MCQ, etc.)
	if (Array.isArray(data)) {
		return data.join(", ");
	}

	// Handle objects (for complex types)
	if (typeof data === "object") {
		return JSON.stringify(data);
	}

	return String(data);
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
	record,
	stack,
	index,
}) => {
	const {
		primaryField,
		displayFields = [],
		options,
		stackField,
		setExpandRecordId,
		permission,
	} = useKanban();

	// Get title from primary field
	const title = useMemo(() => {
		if (!primaryField) return "Untitled";

		const cell = record.cells[primaryField.id];
		if (!cell) return "Untitled";

		const titleValue = formatCellValue(cell);
		return titleValue || "Untitled";
	}, [record, primaryField]);

	// Filter display fields to exclude primary field and stack field
	const visibleFields = useMemo(() => {
		return displayFields.filter((field) => {
			// Don't show the stack field (it's already shown in the column header)
			if (stackField && field.id === stackField.id) {
				return false;
			}
			return true;
		});
	}, [displayFields, stackField]);

	const handleCardClick = () => {
		// Phase 2: Expand record
		if (setExpandRecordId) {
			setExpandRecordId(record.id);
		}
	};

	const canDrag = permission?.canEdit ?? false;

	const cardContent = (
		<div className="bg-white border border-black/[.08] rounded-lg p-3 cursor-grab transition-all duration-200 mb-2 hover:border-[#4a90e2] hover:-translate-y-px active:cursor-grabbing active:translate-y-0" onClick={handleCardClick}>
			<div className="text-sm font-semibold text-[#212121] mb-2.5 break-words leading-[1.4] overflow-hidden text-ellipsis line-clamp-2">{title}</div>

			{visibleFields.length > 0 && (
				<div className="flex flex-col gap-4">
					{visibleFields.map((field) => {
						const cell = record.cells[field.id];
						if (!cell) return null;

						// Check if cell has any data (not empty)
						if (isEmptyValue(cell)) return null;

						return (
							<div key={field.id}>
								{!options?.isFieldNameHidden && (
									<div className="text-[11px] text-[#666] font-medium mb-1.5">
										{field.name}
									</div>
								)}
								<div className="text-[13px] text-[#212121] min-h-[20px] flex items-center flex-wrap gap-1 max-w-full overflow-hidden">
									<CellDisplay cell={cell} column={field} />
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);

	return (
		<Draggable
			draggableId={record.id}
			index={index}
			isDragDisabled={!canDrag}
		>
			{(provided, snapshot) => (
				<div
					ref={provided.innerRef}
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					style={{
						...provided.draggableProps.style,
						opacity: snapshot.isDragging ? 0.5 : 1,
					}}
				>
					{cardContent}
				</div>
			)}
		</Draggable>
	);
};
