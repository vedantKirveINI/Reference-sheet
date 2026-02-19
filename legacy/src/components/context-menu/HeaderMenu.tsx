// Header Menu Component - Inspired by Teable
// Map-driven configuration for column context menu
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/FieldMenu.tsx

import React, { useMemo } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import ODSPopover from "oute-ds-popover";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ComingSoonTag from "@/components/common/ComingSoonTag";
import { headerMenuConfig } from "./HeaderMenu/configuration";
import {
	openSortModal,
	openFilterModal,
	openGroupByModal,
} from "./HeaderMenu/actionHandlers";

/**
 * Header Menu - Context menu for column headers
 * Shows options organized in 4 sections: Field Editing, Information/Permissions, Data Organization, Visibility/Deletion
 * Uses map-driven configuration for easy maintenance and extension
 */
export const HeaderMenu: React.FC = () => {
	const { headerMenu, closeHeaderMenu } = useGridViewStore();

	// Extract values with defaults to avoid conditional hook calls
	const columns = headerMenu?.columns || [];
	const onSelectionClear = headerMenu?.onSelectionClear;
	const onEditColumn = headerMenu?.onEditColumn;
	const onDuplicateColumn = headerMenu?.onDuplicateColumn;
	const onInsertColumn = headerMenu?.onInsertColumn;
	const onDeleteColumns = headerMenu?.onDeleteColumns;
	const position = headerMenu?.position;
	const currentSort = headerMenu?.currentSort;
	const currentFilter = headerMenu?.currentFilter;
	const currentGroupBy = headerMenu?.currentGroupBy;
	const fields = headerMenu?.fields || [];
	const isSingleColumn = columns.length === 1;

	// Build menu items from configuration, grouped by sections
	// Must call useMemo before any early returns to follow Rules of Hooks
	const menuItems = useMemo(() => {
		if (!headerMenu) {
			return [];
		}

		const items = [];
		let currentSection = 0;

		// Prepare callbacks object
		const callbacks = {
			onEditColumn,
			onDuplicateColumn,
			onInsertColumn,
			onDeleteColumns,
			onSelectionClear,
			onSortAsc: (column: any, closeMenu: () => void) => {
				openSortModal(column, "asc", currentSort, fields, closeMenu);
			},
			onSortDesc: (column: any, closeMenu: () => void) => {
				openSortModal(column, "desc", currentSort, fields, closeMenu);
			},
			onFilter: (column: any, closeMenu: () => void) => {
				openFilterModal(column, currentFilter, fields, closeMenu);
			},
			onGroupBy: (column: any, closeMenu: () => void) => {
				openGroupByModal(column, "asc", currentGroupBy, fields, closeMenu);
			},
		};

		headerMenuConfig.forEach((config) => {
			// Check if item should be hidden
			if (config.hidden && config.hidden(isSingleColumn, callbacks)) {
				return;
			}

			// Add divider between sections
			if (config.section > currentSection && currentSection > 0) {
				items.push({
					id: `divider-${config.section}`,
					type: "divider",
				});
			}
			currentSection = config.section;

			// Build right adornments
			const rightAdornments = [];
			if (config.hasTeamBadge) {
				rightAdornments.push(
					<div
						key="team-badge"
						style={{
							display: "inline-flex",
							alignItems: "center",
							backgroundColor: "#1976D2",
							color: "#FFFFFF",
							padding: "2px 6px",
							borderRadius: "10px",
							fontSize: "10px",
							fontWeight: "500",
							marginLeft: "6px",
						}}
					>
						Team
					</div>,
				);
			}
			if (config.hasComingSoon) {
				rightAdornments.push(
					<ComingSoonTag
						key="coming-soon"
						text="Coming soon"
						variant="gray"
					/>,
				);
			}

			// Get label (handle function case)
			const label =
				typeof config.label === "function"
					? config.label(columns)
					: config.label;

			items.push({
				id: config.id,
				type: "menu-item",
				label,
				iconName: config.iconName,
				isDestructive: config.isDestructive,
				rightAdornments,
				onClick: () => {
					config.onClick(
						columns,
						callbacks,
						position,
						closeHeaderMenu,
					);
				},
			});
		});

		return items;
	}, [
		headerMenu,
		columns,
		isSingleColumn,
		onEditColumn,
		onDuplicateColumn,
		onInsertColumn,
		onDeleteColumns,
		onSelectionClear,
		position,
		closeHeaderMenu,
		currentSort,
		currentFilter,
		currentGroupBy,
		fields,
	]);

	// Early return after all hooks are called
	if (!headerMenu || menuItems.length === 0) {
		return null;
	}

	const visible = Boolean(headerMenu);

	const anchorPosition = position
		? {
				top: position.y,
				left: position.x,
			}
		: undefined;

	return (
		<ODSPopover
			open={visible}
			anchorReference="anchorPosition"
			anchorPosition={anchorPosition}
			onClose={closeHeaderMenu}
			anchorOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
			transformOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
			slotProps={{
				paper: {
					style: {
						minWidth: "220px",
						padding: "4px 0",
						boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
						border: "0.0625rem solid #e5e7eb",
					},
				},
			}}
		>
			{menuItems.map((item) => {
				if (item.type === "divider") {
					return (
						<Divider
							key={item.id}
							sx={{
								margin: "4px 0",
								backgroundColor: "#E0E0E0",
								"&:hover": {
									backgroundColor: "#E0E0E0",
								},
							}}
						/>
					);
				}

				return (
					<MenuItem
						key={item.id}
						onClick={item.onClick}
						sx={{
							padding: "0.5rem 0.75rem",
							minHeight: "36px",
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							borderRadius: "0.375rem",
							margin: "0.125rem 0.5rem",
							"&:hover": {
								backgroundColor: "#f5f5f5",
							},
						}}
					>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								flex: 1,
							}}
						>
							<ListItemIcon sx={{ minWidth: "32px" }}>
								<ODSIcon
									outeIconName={item.iconName}
									outeIconProps={{
										sx: {
											color: "#90A4AE",
											width: "1rem",
											height: "1rem",
										},
									}}
								/>
							</ListItemIcon>
							<ListItemText
								primary={
									<ODSLabel
										variant="body2"
										sx={{
											fontFamily: "Inter",
											fontSize: "13px",
											fontWeight: "400",
										}}
										color={
											item.isDestructive
												? "#F44336"
												: "#212121"
										}
									>
										{item.label}
									</ODSLabel>
								}
							/>
						</div>
						{item.rightAdornments.length > 0 && (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									marginLeft: "8px",
									gap: "4px",
								}}
							>
								{item.rightAdornments}
							</div>
						)}
					</MenuItem>
				);
			})}
		</ODSPopover>
	);
};
