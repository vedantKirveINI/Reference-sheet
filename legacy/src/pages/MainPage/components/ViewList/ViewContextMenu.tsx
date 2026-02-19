import React, { useCallback } from "react";
import { Separator } from "@/components/ui/separator";
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

	if (!view || !open) return null;

	const isDefault = isDefaultView(view);
	const showDelete = canDelete && !isDefault;

	const rect = anchorEl?.getBoundingClientRect();

	return (
		<>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					zIndex: 999,
				}}
				onClick={onClose}
			/>
			<div
				style={{
					position: "fixed",
					top: (rect?.bottom ?? 0) + 4,
					left: rect?.left ?? 0,
					zIndex: 1000,
					minWidth: "180px",
					borderRadius: "8px",
					border: "1px solid #e5e7eb",
					boxShadow:
						"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 10px 20px -5px rgba(0, 0, 0, 0.1)",
					padding: "4px 0",
					backgroundColor: "#ffffff",
					overflow: "hidden",
				}}
			>
				<div
					onClick={handleRename}
					style={{
						padding: "10px 16px",
						minHeight: "40px",
						display: "flex",
						alignItems: "center",
						gap: "12px",
						fontSize: "14px",
						fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
						color: "#212121",
						cursor: "pointer",
					}}
					onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f5f5f5"; }}
					onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
				>
					<span style={{ minWidth: "20px", color: "#666666", display: "inline-flex" }}>
						<Edit2 size={16} />
					</span>
					<span style={{ fontSize: "14px", fontWeight: 400, color: "#212121" }}>
						Rename view
					</span>
				</div>
				{showDelete && (
					<div
						onClick={handleDelete}
						style={{
							padding: "10px 16px",
							minHeight: "40px",
							display: "flex",
							alignItems: "center",
							gap: "12px",
							fontSize: "14px",
							fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
							color: "#dc2626",
							cursor: "pointer",
						}}
						onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#fef2f2"; }}
						onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
					>
						<span style={{ minWidth: "20px", color: "#dc2626", display: "inline-flex" }}>
							<Trash2 size={16} />
						</span>
						<span style={{ fontSize: "14px", fontWeight: 400, color: "#dc2626" }}>
							Delete view
						</span>
					</div>
				)}
			</div>
		</>
	);
}

export default ViewContextMenu;
