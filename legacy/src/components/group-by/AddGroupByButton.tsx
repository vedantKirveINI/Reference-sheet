import React, { useState, useRef, useEffect } from "react";
import type { IGroupObject } from "@/types/grouping";
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
	const containerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

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
			<div className="p-2 text-center text-[#999] text-xs">
				All fields are already grouped
			</div>
		);
	}

	return (
		<div ref={containerRef} className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-full py-2 px-3 border border-dashed border-[#ccc] rounded bg-white cursor-pointer text-[13px] text-[#666] hover:bg-gray-50"
			>
				+ Add Group
			</button>

			{isOpen && (
				<div className="absolute z-50 mt-1 bg-white border border-[#e5e7eb] rounded-md shadow-lg p-3 min-w-[200px]">
					<div className="mb-2 text-[13px] font-medium">
						Select Field
					</div>
					<select
						value={selectedFieldId || ""}
						onChange={(e) =>
							setSelectedFieldId(Number(e.target.value))
						}
						className="w-full py-1.5 px-2 border border-[#ccc] rounded text-[13px] mb-2"
					>
						<option value="">Choose a field...</option>
						{availableFields.map((field) => (
							<option key={field.id} value={field.id}>
								{field.name} ({field.type})
							</option>
						))}
					</select>
					<Button
						variant="default"
						onClick={handleAdd}
						disabled={!selectedFieldId}
						className="w-full text-[13px]"
					>
						Add
					</Button>
				</div>
			)}
		</div>
	);
};

export default AddGroupByButton;
