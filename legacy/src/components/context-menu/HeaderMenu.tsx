import React, { useMemo } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import ComingSoonTag from "@/components/common/ComingSoonTag";
import { headerMenuConfig } from "./HeaderMenu/configuration";
import {
	openSortModal,
	openFilterModal,
	openGroupByModal,
} from "./HeaderMenu/actionHandlers";

export const HeaderMenu: React.FC = () => {
	const { headerMenu, closeHeaderMenu } = useGridViewStore();

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

	const menuItems = useMemo(() => {
		if (!headerMenu) {
			return [];
		}

		const items: any[] = [];
		let currentSection = 0;

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
			if (config.hidden && config.hidden(isSingleColumn, callbacks)) {
				return;
			}

			if (config.section > currentSection && currentSection > 0) {
				items.push({
					id: `divider-${config.section}`,
					type: "divider",
				});
			}
			currentSection = config.section;

			const rightAdornments: React.ReactNode[] = [];
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

	if (!headerMenu || menuItems.length === 0) {
		return null;
	}

	const visible = Boolean(headerMenu);

	return (
		<>
			{visible && position && (
				<div
					style={{
						position: "fixed",
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						zIndex: 999,
					}}
					onClick={closeHeaderMenu}
				/>
			)}
			<div
				style={{
					position: "fixed",
					top: position?.y ?? 0,
					left: position?.x ?? 0,
					zIndex: 1000,
					minWidth: "220px",
					padding: "4px 0",
					boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
					border: "0.0625rem solid #e5e7eb",
					borderRadius: "0.375rem",
					backgroundColor: "#fff",
					display: visible ? "block" : "none",
				}}
			>
				{menuItems.map((item: any) => {
					if (item.type === "divider") {
						return (
							<Separator
								key={item.id}
								className="my-1"
								style={{ backgroundColor: "#E0E0E0" }}
							/>
						);
					}

					return (
						<div
							key={item.id}
							onClick={item.onClick}
							style={{
								padding: "0.5rem 0.75rem",
								minHeight: "36px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								borderRadius: "0.375rem",
								margin: "0.125rem 0.5rem",
								cursor: "pointer",
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = "#f5f5f5";
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = "transparent";
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									flex: 1,
								}}
							>
								<span style={{ minWidth: "32px", display: "inline-flex", alignItems: "center" }}>
									<span
										style={{
											color: "#90A4AE",
											width: "1rem",
											height: "1rem",
											fontSize: "1rem",
										}}
									/>
								</span>
								<span
									style={{
										fontFamily: "Inter",
										fontSize: "13px",
										fontWeight: "400",
										color: item.isDestructive
											? "#F44336"
											: "#212121",
									}}
								>
									{item.label}
								</span>
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
						</div>
					);
				})}
			</div>
		</>
	);
};
