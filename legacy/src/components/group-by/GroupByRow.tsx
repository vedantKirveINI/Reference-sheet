import React from "react";
import type { IGroupObject } from "@/types/grouping";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

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
		<div
			style={{
				display: "flex",
				alignItems: "center",
				gap: "8px",
				padding: "8px",
				border: "1px solid #e0e0e0",
				borderRadius: "4px",
				backgroundColor: "#fafafa",
			}}
		>
			<select
				value={groupObj.fieldId}
				onChange={(e) => handleFieldChange(Number(e.target.value))}
				style={{
					flex: 1,
					padding: "6px 8px",
					border: "1px solid #ccc",
					borderRadius: "4px",
					fontSize: "13px",
				}}
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
				style={{
					padding: "6px 12px",
					border: "1px solid #ccc",
					borderRadius: "4px",
					backgroundColor: "#fff",
					cursor: "pointer",
					fontSize: "12px",
					fontWeight: 500,
				}}
				title={`Sort ${groupObj.order === "asc" ? "Ascending" : "Descending"}`}
			>
				{groupObj.order === "asc" ? "↑" : "↓"}
			</button>

			<Button
				variant="ghost"
				size="icon"
				onClick={onRemove}
				className="h-6 w-6"
				title="Remove group"
			>
				<X className="h-4 w-4" />
			</Button>
		</div>
	);
};

export default GroupByRow;
