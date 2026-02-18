import React, { useCallback, useRef } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Edit2, Trash2 } from "lucide-react";
import type { IView } from "@/types/view";
import { isDefaultView } from "@/types/view";

interface ViewContextMenuProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	onClose: () => void;
	view: IView | null;
	onRename: (view: IView) => void;
	onDelete: (view: IView) => void;
	canDelete: boolean;
}

function ViewContextMenu({
	anchorEl,
	open,
	onClose,
	view,
	onRename,
	onDelete,
	canDelete,
}: ViewContextMenuProps) {
	const handleRename = useCallback(() => {
		if (view) {
			onRename(view);
			onClose();
		}
	}, [view, onRename, onClose]);

	const handleDelete = useCallback(() => {
		if (view) {
			onDelete(view);
			onClose();
		}
	}, [view, onDelete, onClose]);

	if (!view) return null;

	const isDefault = isDefaultView(view);
	const showDelete = canDelete && !isDefault;

	return (
		<Popover open={open} onOpenChange={(v) => !v && onClose()}>
			<PopoverTrigger asChild>
				<span ref={(node) => {
					if (node && anchorEl) {
						const rect = anchorEl.getBoundingClientRect();
						node.style.position = "fixed";
						node.style.left = `${rect.left}px`;
						node.style.top = `${rect.bottom}px`;
						node.style.width = "0";
						node.style.height = "0";
					}
				}} />
			</PopoverTrigger>
			<PopoverContent className="min-w-[180px] p-1 rounded-lg border border-gray-200 bg-white shadow-lg" align="start">
				<div className="flex flex-col gap-0.5">
					<button
						className="flex items-center gap-3 px-4 py-2.5 text-sm font-normal text-[#212121] rounded-md hover:bg-gray-100 active:bg-gray-200 w-full text-left transition-colors"
						onClick={handleRename}
					>
						<Edit2 className="h-4 w-4 text-[#666666]" />
						<span>Rename view</span>
					</button>
					{showDelete && (
						<button
							className="flex items-center gap-3 px-4 py-2.5 text-sm font-normal text-red-600 rounded-md hover:bg-red-50 active:bg-red-100 w-full text-left transition-colors"
							onClick={handleDelete}
						>
							<Trash2 className="h-4 w-4 text-red-600" />
							<span>Delete view</span>
						</button>
					)}
				</div>
			</PopoverContent>
		</Popover>
	);
}

export default ViewContextMenu;
