/**
 * RecordMenu Configuration
 * Map-driven configuration for record/row context menu items
 * Organized by sections to match reference design
 */

export const recordMenuConfig = [
	// Section 1: AI/Intelligence
	{
		section: 1,
		id: "ask-omni",
		label: "Ask TeeCee",
		iconName: "OUTEPromptIcon",
		available: false,
		hasComingSoon: true,
		isDestructive: false,
		usesCustomRender: false,
		hidden: () => false,
		onClick: (record, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},

	// Section 2: Insert Operations
	{
		section: 2,
		id: "insert-above",
		label: "Insert record above",
		iconName: "OUTEExpandLessIcon",
		available: true,
		hasComingSoon: false,
		isDestructive: false,
		usesCustomRender: true, // Uses InsertRecordRender
		hidden: (isMultipleSelected, record, callbacks) => isMultipleSelected || !record || !callbacks?.insertRecord,
		onClick: (record, callbacks, position, closeMenu) => {
			// Handled by InsertRecordRender
		},
	},
	{
		section: 2,
		id: "insert-below",
		label: "Insert record below",
		iconName: "OUTEExpandMoreIcon",
		available: true,
		hasComingSoon: false,
		isDestructive: false,
		usesCustomRender: true, // Uses InsertRecordRender
		hidden: (isMultipleSelected, record, callbacks) => isMultipleSelected || !record || !callbacks?.insertRecord,
		onClick: (record, callbacks, position, closeMenu) => {
			// Handled by InsertRecordRender
		},
	},

	// Section 3: Record Manipulation
	{
		section: 3,
		id: "apply-template",
		label: "Apply template",
		iconName: "OUTERocketLaunchIcon",
		available: false,
		hasComingSoon: true,
		isDestructive: false,
		usesCustomRender: false,
		hidden: () => false,
		onClick: (record, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 3,
		id: "expand",
		label: "Expand record",
		iconName: "OUTEExpandMoreIcon",
		available: false,
		hasComingSoon: true,
		isDestructive: false,
		usesCustomRender: false,
		hidden: () => false,
		onClick: (record, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},

	// Section 4: Information & Deletion
	{
		section: 4,
		id: "add-comment",
		label: "Add comment",
		iconName: "OUTEHelpIcon",
		available: false,
		hasComingSoon: true,
		isDestructive: false,
		usesCustomRender: false,
		hidden: () => false,
		onClick: (record, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 4,
		id: "copy-url",
		label: "Copy cell URL",
		iconName: "OUTEInsertLinkIcon",
		available: false,
		hasComingSoon: true,
		isDestructive: false,
		usesCustomRender: false,
		hidden: () => false,
		onClick: (record, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 4,
		id: "send",
		label: "Send record",
		iconName: "OUTEEmailIcon",
		available: false,
		hasComingSoon: true,
		isDestructive: false,
		usesCustomRender: false,
		hidden: () => false,
		onClick: (record, callbacks, position, closeMenu) => {
			// Coming soon - no action
			closeMenu();
		},
	},
	{
		section: 4,
		id: "delete",
		label: (isMultipleSelected) =>
			isMultipleSelected ? "Delete record" : "Delete record",
		iconName: "OUTETrashIcon",
		available: true,
		hasComingSoon: false,
		isDestructive: true,
		usesCustomRender: false,
		hidden: (isMultipleSelected, record, callbacks) => !callbacks?.deleteRecords,
		onClick: async (record, callbacks, position, closeMenu) => {
			if (callbacks.deleteRecords) {
				await callbacks.deleteRecords();
			}
			closeMenu();
		},
	},
];
