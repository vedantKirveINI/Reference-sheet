// Record Menu Component - Inspired by Teable
// Map-driven configuration for record/row context menu
// Reference: teable/apps/nextjs-app/src/features/app/blocks/view/grid/components/RecordMenu.tsx

import React, { useCallback, useMemo } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import Popover from "@mui/material/Popover";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import ComingSoonTag from "@/components/common/ComingSoonTag";
import { InsertRecordRender } from "./InsertRecordRender";
import { recordMenuConfig } from "./RecordMenu/configuration";

/**
 * Record Menu - Context menu for rows and cells
 * Shows options organized in 4 sections: AI, Insert, Manipulation, Information & Deletion
 * Uses map-driven configuration for easy maintenance and extension
 */
export const RecordMenu: React.FC = () => {
	const { recordMenu, closeRecordMenu } = useGridViewStore();

	// Extract values with defaults to avoid conditional hook calls
	const record = recordMenu?.record;
	const isMultipleSelected = recordMenu?.isMultipleSelected || false;
	const insertRecord = recordMenu?.insertRecord;
	const duplicateRecord = recordMenu?.duplicateRecord;
	const deleteRecords = recordMenu?.deleteRecords;
	const position = recordMenu?.position;

	// Insert record function - must be called before early return to follow Rules of Hooks
	const insertRecordFn = useCallback(
		(num: number, position: "before" | "after") => {
			if (!recordMenu || !recordMenu.record) return;
			if (insertRecord) {
				insertRecord(recordMenu.record.id, position, num);
			}
		},
		[recordMenu, insertRecord],
	);

	// Build menu items from configuration, grouped by sections
	// Must call useMemo before any early returns to follow Rules of Hooks
	const menuItems = useMemo(() => {
		if (!recordMenu) {
			return [];
		}

		const items = [];
		let currentSection = 0;

		// Prepare callbacks object
		const callbacks = {
			insertRecord: insertRecordFn,
			duplicateRecord,
			deleteRecords,
		};

		recordMenuConfig.forEach((config) => {
			// Check if item should be hidden
			if (config.hidden && config.hidden(isMultipleSelected, record, callbacks)) {
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
					? config.label(isMultipleSelected)
					: config.label;

			// Handle custom render for InsertRecordRender
			if (config.usesCustomRender && record && !isMultipleSelected) {
				const insertPosition =
					config.id === "insert-above" ? "before" : "after";
				items.push({
					id: config.id,
					type: "custom-render",
					label,
					iconName: config.iconName,
					isDestructive: config.isDestructive,
					rightAdornments,
					render: (
						<InsertRecordRender
							onClick={(num: number) => {
								insertRecordFn(num, insertPosition);
								closeRecordMenu();
							}}
							icon={
								<ODSIcon
									outeIconName={config.iconName}
									outeIconProps={{
										sx: {
											color: "#212121",
											width: "1.25rem",
											height: "1.25rem",
										},
									}}
								/>
							}
							type={
								config.id === "insert-above"
									? "InsertAbove"
									: "InsertBelow"
							}
						/>
					),
				});
			} else {
				items.push({
					id: config.id,
					type: "menu-item",
					label,
					iconName: config.iconName,
					isDestructive: config.isDestructive,
					rightAdornments,
					onClick: () => {
						config.onClick(
							record,
							callbacks,
							position,
							closeRecordMenu,
						);
					},
				});
			}
		});

		return items;
	}, [
		recordMenu,
		record,
		isMultipleSelected,
		insertRecordFn,
		duplicateRecord,
		deleteRecords,
		position,
		closeRecordMenu,
	]);

	// Early return after all hooks are called
	if (!recordMenu || menuItems.length === 0) {
		return null;
	}

	const visible = Boolean(recordMenu);

	const anchorPosition = position
		? {
				top: position.y,
				left: position.x,
			}
		: undefined;

	return (
		<Popover
			open={visible}
			anchorReference="anchorPosition"
			anchorPosition={anchorPosition}
			onClose={closeRecordMenu}
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
						minWidth: "200px",
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

				if (item.type === "custom-render") {
					return (
						<div key={item.id} style={{ padding: 0 }}>
							{item.render}
						</div>
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
											color: "#212121",
											width: "1.25rem",
											height: "1.25rem",
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
		</Popover>
	);
};
