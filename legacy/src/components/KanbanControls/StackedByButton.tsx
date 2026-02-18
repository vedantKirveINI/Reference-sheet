import React, { useState } from "react";
import ODSIcon from "@/lib/oute-icon";
import UpdateKanbanViewModal from "@/pages/MainPage/components/UpdateViewModal";
import type { IColumn } from "@/types";

interface IKanbanViewOptions {
	stackFieldId?: string | number | null;
	isEmptyStackHidden?: boolean;
}

interface StackedByButtonProps {
	stackFieldName?: string;
	columns?: IColumn[];
	viewOptions?: IKanbanViewOptions | null;
	viewId: string;
	onSuccess?: (updatedView: any) => void;
	loading?: boolean;
}

export const StackedByButton: React.FC<StackedByButtonProps> = ({
	stackFieldName = "Select",
	columns = [],
	viewOptions,
	viewId,
	onSuccess,
	loading = false,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const displayText = stackFieldName;

	const handleModalClose = () => {
		setIsModalOpen(false);
	};

	const handleSuccess = (updatedView: any) => {
		if (onSuccess) {
			onSuccess(updatedView);
		}
	};

	return (
		<>
			<div
				className="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer hover:bg-[#f5f5f5] transition-colors"
				onClick={() => setIsModalOpen(true)}
			>
				<ODSIcon
					outeIconName="OUTEGroup"
					outeIconProps={{
						className: "w-4 h-4 text-[#263238]",
					}}
				/>
				<span className="text-[13px] text-[#374151] whitespace-nowrap">
					Stacked by {displayText}
				</span>
				<ODSIcon
					outeIconName="OUTEChevronDownIcon"
					outeIconProps={{
						className: "w-3 h-3 text-[#666]",
					}}
				/>
			</div>

			<UpdateKanbanViewModal
				open={isModalOpen}
				onClose={handleModalClose}
				columns={columns}
				viewOptions={viewOptions}
				viewId={viewId}
				onSuccess={handleSuccess}
			/>
		</>
	);
};
