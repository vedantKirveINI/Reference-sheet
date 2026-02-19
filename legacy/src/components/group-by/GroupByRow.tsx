// Phase 1: Individual GroupBy Row Component
// Reference: teable/packages/sdk/src/components/base-query/editors/QueryGroup.tsx

import React from "react";
import type { IGroupObject } from "@/types/grouping";
// Using ODS components - adjust imports based on actual package structure
// @ts-ignore - ODS components may not have full TypeScript definitions
import Button from "oute-ds-button";
// @ts-ignore
import TextField from "oute-ds-text-field";
// @ts-ignore
import Icon from "oute-ds-icon";

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
			{/* Field Selector - Simplified for Phase 1 */}
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

			{/* Order Toggle */}
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

			{/* Remove Button */}
			<button
				onClick={onRemove}
				style={{
					padding: "6px",
					border: "none",
					backgroundColor: "transparent",
					cursor: "pointer",
					color: "#666",
					fontSize: "16px",
				}}
				title="Remove group"
			>
				×
			</button>
		</div>
	);
};

export default GroupByRow;
