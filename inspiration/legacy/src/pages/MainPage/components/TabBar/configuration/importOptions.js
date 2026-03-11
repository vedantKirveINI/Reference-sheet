/**
 * Import Options Configuration
 * Mapping-based structure for easy addition of new import sources
 */
export const importOptions = [
	{
		id: "airtable-base",
		label: "Airtable base",
		iconName: "OUTECloudIcon",
		hasTeamBadge: true,
		hasComingSoon: false,
		handler: () => {
			// TODO: Implement Airtable import
		},
	},
	{
		id: "csv-file",
		label: "CSV file",
		iconName: "OUTEFileIcon",
		hasTeamBadge: false,
		hasComingSoon: false,
		handler: (setImportSource, setImportModalOpen) => {
			setImportSource("newTable");
			setImportModalOpen(true);
		},
	},
	{
		id: "microsoft-excel",
		label: "Microsoft Excel",
		iconName: "OUTEFileIcon",
		hasTeamBadge: false,
		hasComingSoon: false,
		handler: (setImportSource, setImportModalOpen) => {
			setImportSource("newTable");
			setImportModalOpen(true);
		},
	},
	{
		id: "google-sheets",
		label: "Google Sheets",
		iconName: "OUTEFileIcon",
		hasTeamBadge: false,
		hasComingSoon: true,
		handler: () => {
			// TODO: Implement Google Sheets import
		},
	},
	{
		id: "paste-table-data",
		label: "Paste table data",
		iconName: "OUTEClipboardIcon",
		hasTeamBadge: false,
		hasComingSoon: true,
		handler: () => {
			// TODO: Implement paste table data
		},
	},
];




