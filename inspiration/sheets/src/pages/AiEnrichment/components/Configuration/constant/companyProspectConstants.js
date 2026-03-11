const FIELDS_PAYLOAD = [
	{
		name: "Title",
		type: "SHORT_TEXT",
		options: { reference: "title" },
	},
	{
		name: "Url",
		type: "SHORT_TEXT",
		options: { reference: "url" },
	},
	{
		name: "Content",
		type: "SHORT_TEXT",
		options: { reference: "content" },
	},
];

const PREVIEW_FIELDS = [
	{ name: "Title", type: "SHORT_TEXT" },
	{ name: "Url", type: "SHORT_TEXT" },
	{ name: "Content", type: "SHORT_TEXT" },
];

const STEPS = [
	{
		label: "Configure AI Enrichment",
		description: "Set up your AI enrichment parameters and filters",
	},
	{
		label: "Review ICP Data",
		description: "Review and filter the generated ICP data",
	},
];

export { FIELDS_PAYLOAD, PREVIEW_FIELDS, STEPS };
