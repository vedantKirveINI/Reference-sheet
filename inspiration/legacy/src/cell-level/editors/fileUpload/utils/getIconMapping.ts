/**
 * Icon mapping for file viewer actions
 * Inspired by sheets project's getIconMapping
 */

interface FileAction {
	name: string;
	iconProp: {
		outeIconName: string;
		outeIconProps: {
			width: string;
			height: string;
		};
		buttonProps?: {
			sx?: any;
			"data-testid"?: string;
		};
	};
	onClick: (file: any) => void;
}

interface GetIconMappingProps {
	handleFileView: (file: any) => void;
	downloadFile: (file: any) => void;
	handleFileRemove: (file: any) => void;
}

export function getIconMapping({
	handleFileView,
	downloadFile,
	handleFileRemove,
}: GetIconMappingProps): FileAction[] {
	return [
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
}
