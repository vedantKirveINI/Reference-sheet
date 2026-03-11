// File Upload Renderer for Kanban Cards
import React, { useState } from "react";
import ODSIcon from "oute-ds-icon";
import type { ICell, IColumn } from "@/types";
import { getFileIcon } from "@/cell-level/renderers/fileUpload/utils/getFileIcon";
import styles from "./FileUploadRenderer.module.scss";

interface FileUploadRendererProps {
	cell: ICell;
	column: IColumn;
}

interface FileItemProps {
	file: any;
}

const FileItem: React.FC<FileItemProps> = ({ file }) => {
	const [imageError, setImageError] = useState(false);
	const isImage = file.mimeType?.startsWith("image/");

	if (isImage && file.url && !imageError) {
		// Show image preview for images
		return (
			<div className={styles.fileImage}>
				<img
					src={file.url}
					alt="File preview"
					className={styles.imagePreview}
					onError={() => setImageError(true)}
				/>
			</div>
		);
	}

	// Show icon for non-image files or if image failed to load
	return (
		<div className={styles.fileIcon}>
			<ODSIcon
				outeIconName={getFileIcon(file.mimeType || "")}
				outeIconProps={{
					sx: {
						width: "2rem",
						height: "2rem",
						color: "#666",
					},
				}}
			/>
		</div>
	);
};

export const FileUploadRenderer: React.FC<FileUploadRendererProps> = ({
	cell,
}) => {
	const files = Array.isArray(cell.data) ? cell.data : [];
	if (files.length === 0) return null;

	return (
		<div className={styles.filesContainer}>
			{files.map((file: any, index: number) => (
				<FileItem key={index} file={file} />
			))}
		</div>
	);
};
