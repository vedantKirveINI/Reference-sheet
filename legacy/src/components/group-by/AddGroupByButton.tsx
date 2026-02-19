import React, { useState } from "react";
import type { IGroupObject } from "@/types/grouping";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

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
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
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
			</PopoverTrigger>
			<PopoverContent style={{ minWidth: "200px" }}>
				<div style={{ padding: "4px" }}>
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
					<Button
						onClick={handleAdd}
						disabled={!selectedFieldId}
						className="w-full"
						size="sm"
					>
						Add
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default AddGroupByButton;
