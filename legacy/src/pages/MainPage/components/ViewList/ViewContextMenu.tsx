// View Context Menu - Right-click menu for view actions
// Inspired by RecordMenu pattern
import React, { useCallback } from "react";
import Popover from "@mui/material/Popover";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
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
		<Popover
			open={open}
			anchorEl={anchorEl}
			onClose={onClose}
			anchorOrigin={{
				vertical: "bottom",
				horizontal: "left",
			}}
			transformOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
			PaperProps={{
				sx: {
					minWidth: "180px",
					borderRadius: "8px",
					border: "1px solid #e5e7eb",
					boxShadow:
						"0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 10px 20px -5px rgba(0, 0, 0, 0.1)",
					marginTop: "4px",
					padding: "4px 0",
					backgroundColor: "#ffffff",
					overflow: "hidden",
				},
			}}
		>
			<MenuItem
				onClick={handleRename}
				sx={{
					padding: "10px 16px",
					minHeight: "40px",
					display: "flex",
					alignItems: "center",
					gap: "12px",
					fontSize: "14px",
					fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
					color: "#212121",
					transition: "background-color 0.15s ease",
					"&:hover": {
						backgroundColor: "#f5f5f5",
					},
					"&:active": {
						backgroundColor: "#eeeeee",
					},
				}}
			>
				<ListItemIcon
					sx={{
						minWidth: "20px",
						color: "#666666",
						"& svg": {
							width: "16px",
							height: "16px",
						},
					}}
				>
					<Edit2 size={16} />
				</ListItemIcon>
				<ListItemText
					primary="Rename view"
					primaryTypographyProps={{
						fontSize: "14px",
						fontWeight: 400,
						color: "#212121",
					}}
				/>
			</MenuItem>
			{showDelete && (
				<MenuItem
					onClick={handleDelete}
					sx={{
						padding: "10px 16px",
						minHeight: "40px",
						display: "flex",
						alignItems: "center",
						gap: "12px",
						fontSize: "14px",
						fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
						color: "#dc2626",
						transition: "background-color 0.15s ease",
						"&:hover": {
							backgroundColor: "#fef2f2",
						},
						"&:active": {
							backgroundColor: "#fee2e2",
						},
					}}
				>
					<ListItemIcon
						sx={{
							minWidth: "20px",
							color: "#dc2626",
							"& svg": {
								width: "16px",
								height: "16px",
							},
						}}
					>
						<Trash2 size={16} />
					</ListItemIcon>
					<ListItemText
						primary="Delete view"
						primaryTypographyProps={{
							fontSize: "14px",
							fontWeight: 400,
							color: "#dc2626",
						}}
					/>
				</MenuItem>
			)}
		</Popover>
	);
}

export default ViewContextMenu;

