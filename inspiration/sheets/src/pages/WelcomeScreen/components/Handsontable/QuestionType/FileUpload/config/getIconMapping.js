const getIconMapping = ({ handleFileView, downloadFile, handleFileRemove }) => {
	const ICON_MAPPING = [
		{
			name: "view",
			iconProp: {
				outeIconName: "VisibilityOnOutlinedIcon",
				outeIconProps: {
					width: "1.5rem",
					height: "1.5rem",
				},
				buttonProps: {
					sx: {
						padding: 0,
					},
					"data-testid": "view-icon",
				},
			},
			onClick: handleFileView,
		},
		{
			name: "download",
			iconProp: {
				outeIconName: "OUTEDownloadIcon",
				outeIconProps: {
					width: "1.5rem",
					height: "1.5rem",
				},
				buttonProps: {
					sx: {
						padding: 0,
					},
					"data-testid": "download-icon",
				},
			},
			onClick: downloadFile,
		},
		{
			name: "close",
			iconProp: {
				outeIconName: "OUTETrashIcon",
				outeIconProps: {
					width: "1.5rem",
					height: "1.5rem",
				},
				buttonProps: {
					sx: {
						padding: 0,
					},
					"data-testid": "delete-icon",
				},
			},
			onClick: handleFileRemove,
		},
	];
	return ICON_MAPPING;
};

export default getIconMapping;
