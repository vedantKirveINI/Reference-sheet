// Phase 1: Add GroupBy Button Component
// Reference: teable/packages/sdk/src/components/base-query/editors/QueryGroup.tsx

import React, { useState } from "react";
import type { IGroupObject } from "@/types/grouping";
// @ts-ignore
import Popover from "oute-ds-popover";
// @ts-ignore
import Button from "oute-ds-button";

interface AddGroupByButtonProps {
	fields: Array<{ id: number; name: string; type: string }>;
	existingFieldIds: number[];
	onAdd: (groupObj: IGroupObject) => void;
}

const AddGroupByButton: React.FC<AddGroupByButtonProps> = ({
	fields,
	existingFieldIds,
	onAdd,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null);

	const availableFields = fields.filter(
		(f) => !existingFieldIds.includes(f.id),
	);

	const handleAdd = () => {
		if (!selectedFieldId) return;
		const field = fields.find((f) => f.id === selectedFieldId);
		if (field) {
			onAdd({
				fieldId: selectedFieldId,
				order: "asc",
				type: field.type,
			});
			setSelectedFieldId(null);
			setIsOpen(false);
		}
	};

	if (availableFields.length === 0) {
		return (
			<div
				style={{
					padding: "8px",
					textAlign: "center",
					color: "#999",
					fontSize: "12px",
				}}
			>
				All fields are already grouped
			</div>
		);
	}

	return (
		<Popover
			open={isOpen}
			onOpenChange={setIsOpen}
			content={
				<div style={{ padding: "12px", minWidth: "200px" }}>
					<div
						style={{
							marginBottom: "8px",
							fontSize: "13px",
							fontWeight: 500,
						}}
					>
						Select Field
					</div>
					<select
						value={selectedFieldId || ""}
						onChange={(e) =>
							setSelectedFieldId(Number(e.target.value))
						}
						style={{
							width: "100%",
							padding: "6px 8px",
							border: "1px solid #ccc",
							borderRadius: "4px",
							fontSize: "13px",
							marginBottom: "8px",
						}}
					>
						<option value="">Choose a field...</option>
						{availableFields.map((field) => (
							<option key={field.id} value={field.id}>
								{field.name} ({field.type})
							</option>
						))}
					</select>
					<button
						onClick={handleAdd}
						disabled={!selectedFieldId}
						style={{
							width: "100%",
							padding: "6px 12px",
							border: "none",
							borderRadius: "4px",
							backgroundColor: selectedFieldId
								? "#1976d2"
								: "#ccc",
							color: "#fff",
							cursor: selectedFieldId ? "pointer" : "not-allowed",
							fontSize: "13px",
						}}
					>
						Add
					</button>
				</div>
			}
		>
			<button
				style={{
					width: "100%",
					padding: "8px 12px",
					border: "1px dashed #ccc",
					borderRadius: "4px",
					backgroundColor: "#fff",
					cursor: "pointer",
					fontSize: "13px",
					color: "#666",
				}}
			>
				+ Add Group
			</button>
		</Popover>
	);
};

export default AddGroupByButton;
