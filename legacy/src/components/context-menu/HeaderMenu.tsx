import React, { useMemo, useEffect, useRef } from "react";
import { useGridViewStore } from "@/stores/gridViewStore";
import ODSIcon from "@/lib/oute-icon";
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
	const menuRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		if (!headerMenu) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				closeHeaderMenu();
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [headerMenu, closeHeaderMenu]);

	const menuItems = useMemo(() => {
		if (!headerMenu) return [];

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

		headerMenuConfig.forEach((config: any) => {
			if (config.hidden && config.hidden(isSingleColumn, callbacks)) return;

			if (config.section > currentSection && currentSection > 0) {
				items.push({ id: `divider-${config.section}`, type: "divider" });
			}
			currentSection = config.section;

			const rightAdornments: React.ReactNode[] = [];
			if (config.hasTeamBadge) {
				rightAdornments.push(
					<span
						key="team-badge"
						className="inline-flex items-center bg-[#1976D2] text-white px-1.5 py-0.5 rounded-[10px] text-[10px] font-medium ml-1.5"
					>
						Team
					</span>,
				);
			}
			if (config.hasComingSoon) {
				rightAdornments.push(
					<ComingSoonTag key="coming-soon" text="Coming soon" variant="gray" />,
				);
			}

			const label = typeof config.label === "function" ? config.label(columns) : config.label;

			items.push({
				id: config.id,
				type: "menu-item",
				label,
				iconName: config.iconName,
				isDestructive: config.isDestructive,
				rightAdornments,
				onClick: () => {
					config.onClick(columns, callbacks, position, closeHeaderMenu);
				},
			});
		});

		return items;
	}, [
		headerMenu, columns, isSingleColumn, onEditColumn, onDuplicateColumn,
		onInsertColumn, onDeleteColumns, onSelectionClear, position,
		closeHeaderMenu, currentSort, currentFilter, currentGroupBy, fields,
	]);

	if (!headerMenu || menuItems.length === 0) return null;

	return (
		<div
			ref={menuRef}
			className="fixed z-50 min-w-[220px] py-1 bg-white rounded-md shadow-[0px_4px_6px_rgba(0,0,0,0.1)] border border-gray-200"
			style={{ top: position?.y, left: position?.x }}
		>
			{menuItems.map((item: any) => {
				if (item.type === "divider") {
					return <Separator key={item.id} className="my-1 bg-[#E0E0E0]" />;
				}

				return (
					<button
						key={item.id}
						onClick={item.onClick}
						className="flex items-center justify-between w-[calc(100%-1rem)] px-3 py-2 min-h-[36px] rounded-md mx-2 my-0.5 hover:bg-[#f5f5f5] transition-colors text-left"
					>
						<div className="flex items-center flex-1">
							<span className="min-w-[32px] flex items-center">
								<ODSIcon
									outeIconName={item.iconName}
									outeIconProps={{ size: 16, className: "text-[#90A4AE]" }}
								/>
							</span>
							<span
								className={`font-[Inter] text-[13px] font-normal ${item.isDestructive ? "text-[#F44336]" : "text-[#212121]"}`}
							>
								{item.label}
							</span>
						</div>
						{item.rightAdornments.length > 0 && (
							<div className="flex items-center ml-2 gap-1">
								{item.rightAdornments}
							</div>
						)}
					</button>
				);
			})}
		</div>
	);
};
