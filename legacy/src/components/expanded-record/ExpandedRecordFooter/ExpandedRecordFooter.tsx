import React from "react";
import { Button } from "@/components/ui/button";

interface IExpandedRecordFooterProps {
	onCancel: () => void;
	onSave: () => void;
	hasChanges?: boolean;
	isSaving?: boolean;
}

export const ExpandedRecordFooter: React.FC<IExpandedRecordFooterProps> = ({
	onCancel,
	onSave,
	hasChanges = false,
	isSaving = false,
}) => {
	return (
		<div className="flex justify-end items-center px-4 gap-2">
			<Button
				variant="outline"
				onClick={onCancel}
				disabled={isSaving}
				className="text-sm font-medium px-4 py-[0.4375rem] rounded-md mr-2"
			>
				CANCEL
			</Button>
			<Button
				variant="default"
				onClick={onSave}
				disabled={isSaving || !hasChanges}
				className="text-sm font-medium px-4 py-[0.4375rem] rounded-md"
			>
				SAVE
			</Button>
		</div>
	);
};
