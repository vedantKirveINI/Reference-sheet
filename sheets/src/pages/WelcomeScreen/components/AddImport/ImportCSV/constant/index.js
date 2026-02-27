const FILE_UPLOAD_SETTINGS = {
	required: true,
	fileSize: 10,
	noOfFilesAllowed: 1,
	allowedFileTypes: [{ extension: "csv" }],
};

const TITLE_TYPING = {
	0: "New Table",
	1: "File Upload",
	2: "Import File",
	3: "Import File",
	4: "Import File",
};

const TITLE_ICON = {
	0: {
		outeIconName: "OUTEAddIcon",
		outeIconProps: { sx: { height: "1.5rem", width: "1.5rem" } },
	},
	1: {
		outeIconName: "UploadFileIcon",
		outeIconProps: { sx: { height: "2rem", width: "2rem" } },
	},
	2: {
		outeIconName: "OUTEUploadIcon",
		outeIconProps: {
			sx: { height: "2rem", width: "2rem", color: "#90A4AE" },
		},
	},
	3: {
		outeIconName: "OUTEUploadIcon",
		outeIconProps: {
			sx: { height: "2rem", width: "2rem", color: "#90A4AE" },
		},
	},
	4: {
		outeIconName: "OUTEUploadIcon",
		outeIconProps: {
			sx: { height: "2rem", width: "2rem", color: "#90A4AE" },
		},
	},
};

const ALLOWED_FIELD_TYPES = [
	{ label: "Short Text", value: "SHORT_TEXT" },
	{ label: "Long Text", value: "LONG_TEXT" },
	{ label: "Number", value: "NUMBER" },
	{ label: "Email", value: "EMAIL" },
	{ label: "Date", value: "DATE" },
];

export { FILE_UPLOAD_SETTINGS, TITLE_TYPING, TITLE_ICON, ALLOWED_FIELD_TYPES };
