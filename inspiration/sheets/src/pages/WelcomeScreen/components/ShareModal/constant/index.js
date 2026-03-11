const ROLE_OPTIONS = [
	{
		value: "viewer",
		label: "Viewer",
		description: "Can only view the table.",
	},
	{
		value: "editor",
		label: "Editor",
		description: "Can add, edit, and delete records and share the table.",
	},
	{
		value: "remove access",
		label: "Remove",
		description: "Revokes all access to the table.",
	},
];

export default ROLE_OPTIONS;
