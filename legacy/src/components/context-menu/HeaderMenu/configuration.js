/**
 * HeaderMenu Configuration
 * Map-driven configuration for column context menu items
 * Organized by sections to match reference design
 */

import { getSortLabel } from "./actionHandlers";

export const headerMenuConfig = [
	// Section 1: Field Editing and Structure
	{
		section: 1,
		id: "edit",
		label: "Edit field",
		iconName: "OUTEEditIcon",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: (isSingleColumn, callbacks) => !isSingleColumn || !callbacks?.onEditColumn,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (callbacks.onEditColumn && columns[0]) {
				callbacks.onEditColumn(columns[0].id, position);
			}
			closeMenu();
		},
	},
	{
		section: 1,
		id: "insert-left",
		label: "Insert left",
		iconName: "OUTEChevronLeftIcon",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: (isSingleColumn, callbacks) => !isSingleColumn || !callbacks?.onInsertColumn,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (callbacks.onInsertColumn && columns[0]) {
				callbacks.onInsertColumn(columns[0].id, "left", position);
			}
			closeMenu();
		},
	},
	{
		section: 1,
		id: "insert-right",
		label: "Insert right",
		iconName: "OUTEChevronRightIcon",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: (isSingleColumn, callbacks) => !isSingleColumn || !callbacks?.onInsertColumn,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (callbacks.onInsertColumn && columns[0]) {
				callbacks.onInsertColumn(columns[0].id, "right", position);
			}
			closeMenu();
		},
	},

	// Section 2: Field Information and Permissions
	{
		section: 2,
		id: "copy-url",
		label: "Copy field URL",
		iconName: "OUTEInsertLinkIcon",
		available: false,
		hasTeamBadge: false,
		hasComingSoon: true,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 2,
		id: "edit-description",
		label: "Edit field description",
		iconName: "OUTEInfoIcon",
		available: false,
		hasTeamBadge: false,
		hasComingSoon: true,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 2,
		id: "edit-permissions",
		label: "Edit field permissions",
		iconName: "OUTESettingIcon",
		available: false,
		hasTeamBadge: true,
		hasComingSoon: true,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},

	// Section 3: Data Organization
	{
		section: 3,
		id: "sort-asc",
		label: (columns) => {
			if (!columns || columns.length === 0) return "Sort 1 → 9";
			return getSortLabel(columns[0], "asc");
		},
		iconName: "OUTESwapHorizontal",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (columns && columns[0] && callbacks.onSortAsc) {
				callbacks.onSortAsc(columns[0], closeMenu);
			} else {
				closeMenu();
			}
		},
	},
	{
		section: 3,
		id: "sort-desc",
		label: (columns) => {
			if (!columns || columns.length === 0) return "Sort 9 → 1";
			return getSortLabel(columns[0], "desc");
		},
		iconName: "OUTESwapHorizontal",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (columns && columns[0] && callbacks.onSortDesc) {
				callbacks.onSortDesc(columns[0], closeMenu);
			} else {
				closeMenu();
			}
		},
	},
	{
		section: 3,
		id: "filter",
		label: "Filter by this field",
		iconName: "OUTEFilterIcon",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (columns && columns[0] && callbacks.onFilter) {
				callbacks.onFilter(columns[0], closeMenu);
			} else {
				closeMenu();
			}
		},
	},
	{
		section: 3,
		id: "group",
		label: "Group by this field",
		iconName: "OUTEListAltIcon",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (columns && columns[0] && callbacks.onGroupBy) {
				callbacks.onGroupBy(columns[0], closeMenu);
			} else {
				closeMenu();
			}
		},
	},

	// Section 4: Field Visibility and Deletion
	{
		section: 4,
		id: "hide",
		label: "Hide field",
		iconName: "OUTEVisibilityOffIcon",
		available: false,
		hasTeamBadge: false,
		hasComingSoon: true,
		isDestructive: false,
		hidden: () => false,
		onClick: (columns, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 4,
		id: "delete",
		label: (columns) =>
			columns.length > 1 ? "Delete field" : "Delete field",
		iconName: "OUTETrashIcon",
		available: true,
		hasTeamBadge: false,
		hasComingSoon: false,
		isDestructive: true,
		hidden: (isSingleColumn, callbacks) => !callbacks?.onDeleteColumns,
		onClick: (columns, callbacks, position, closeMenu) => {
			if (callbacks.onDeleteColumns) {
				// rawId is the database field ID, while id is the dbFieldName
				const columnIds = columns
					.map((column) => {
						const rawId = column.rawId ?? column.id;
						// Convert to number, filter out invalid values
						const numId = typeof rawId === "number" ? rawId : Number(rawId);
						return isNaN(numId) ? null : numId;
					})
					.filter((id) => id !== null);
				callbacks.onDeleteColumns(columnIds);
			}
			callbacks.onSelectionClear?.();
			closeMenu();
		},
	},
];

