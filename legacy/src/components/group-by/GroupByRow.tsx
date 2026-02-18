import React from "react";
import type { IGroupObject } from "@/types/grouping";
import ODSIcon from "@/lib/oute-icon";

interface GroupByRowProps {
	groupObj: IGroupObject;
	fields: Array<{ id: number; name: string; type: string }>;
	onUpdate: (updated: IGroupObject) => void;
	onRemove: () => void;
}

const GroupByRow: React.FC<GroupByRowProps> = ({
	groupObj,
	fields,
	onUpdate,
	onRemove,
}) => {
	const selectedField = fields.find((f) => f.id === groupObj.fieldId);

	const handleFieldChange = (fieldId: number) => {
		const field = fields.find((f) => f.id === fieldId);
		if (field) {
			onUpdate({
				...groupObj,
				fieldId,
				type: field.type,
			});
		}
	};

	const handleOrderChange = (order: "asc" | "desc") => {
		onUpdate({
			...groupObj,
			order,
		});
	};

	return (
		<div className="flex items-center gap-2 p-2 border border-[#e0e0e0] rounded bg-[#fafafa]">
			<select
				value={groupObj.fieldId}
				onChange={(e) => handleFieldChange(Number(e.target.value))}
				className="flex-1 py-1.5 px-2 border border-[#ccc] rounded text-[13px]"
			>
				{fields.map((field) => (
					<option key={field.id} value={field.id}>
						{field.name} ({field.type})
					</option>
				))}
			</select>

			<button
				onClick={() =>
					handleOrderChange(groupObj.order === "asc" ? "desc" : "asc")
				}
				className="py-1.5 px-3 border border-[#ccc] rounded bg-white cursor-pointer text-xs font-medium hover:bg-gray-50"
				title={`Sort ${groupObj.order === "asc" ? "Ascending" : "Descending"}`}
			>
				{groupObj.order === "asc" ? "↑" : "↓"}
			</button>

			<button
				onClick={onRemove}
				className="p-1.5 border-none bg-transparent cursor-pointer text-[#666] text-base hover:text-[#333]"
				title="Remove group"
			>
				×
			</button>
		</div>
	);
};

export default GroupByRow;
