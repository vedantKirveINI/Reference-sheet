/**
 * FileViewerContent Component
 * Displays list of uploaded files with actions (view, download, remove)
 * Inspired by sheets project's FileViewerContent
 */

import React from "react";
import ODSIcon from "oute-ds-icon";
import { getFileIcon } from "@/pages/MainPage/components/FilePicker/utils/getFileIcon";
import { useFileViewerContentHandler } from "../hooks/useFileViewerContentHandler";
import { getIconMapping } from "../utils/getIconMapping";
import { convertBytes } from "../utils/convertBytes";
import styles from "./FileViewerContent.module.css";

interface FileUploadFile {
	url: string;
	size: number;
	mimeType: string;
}

interface FileViewerContentProps {
	files: FileUploadFile[];
	setFiles: (files: FileUploadFile[]) => void;
	onSave: (files: FileUploadFile[]) => void;
}

// Extract filename from URL
function getFileNameFromUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const fileName = pathname.split("/").pop() || "";
		return decodeURIComponent(fileName);
	} catch (e) {
		// Fallback: try to extract from string
		const parts = url.split("/");
		return decodeURIComponent(parts[parts.length - 1] || "");
	}
}

export const FileViewerContent: React.FC<FileViewerContentProps> = ({
	files = [],
	setFiles,
	onSave,
}) => {
	const { handleFileView, downloadFile, handleFileRemove } =
		useFileViewerContentHandler({
			files,
			setFiles,
			onSave,
		});

	const iconMapping = getIconMapping({
		handleFileRemove,
		handleFileView,
		downloadFile,
	});

	return (
		<div data-testid="file-viewer-container">
			<div className={styles.total_files_container}>
				<div>Total</div>
				<div className={styles.total_files_count}>
					{files?.length} file{files?.length !== 1 ? "s" : ""}
				</div>
			</div>

			<div className={styles.file_picker_content}>
				{(files || []).map((item, index) => {
					const fileSize = item?.size
						? convertBytes({ bytes: item.size })
						: "-";

					const fileName = getFileNameFromUrl(item?.url) || "";

					return (
						<div
							className={styles.file_upload_container}
							key={`${item?.url}_${index}`}
							data-testid={`file-viewer-${index}`}
						>
							<div className={styles.file_info_container}>
								<ODSIcon
									outeIconName={getFileIcon(item?.mimeType)}
									outeIconProps={{
										sx: {
											width: "32px",
											height: "32px",
											color: "#212121",
										},
									}}
								/>

								<span className={styles.file_url}>
									{fileName || "-"}
								</span>

								<span
									className={
										styles.file_upload_size_container
									}
								>
									{fileSize}
								</span>
							</div>

							<div
								className={
									styles.file_upload_action_icons_container
								}
							>
								{iconMapping.map((icon) => {
									const { name, iconProp, onClick } = icon;
									return (
										<ODSIcon
											key={name}
											outeIconProps={{
												sx: {
													color: "#90A4AE",
													width: "24px",
													height: "24px",
													cursor: "pointer",
												},
											}}
											{...iconProp}
											{...(onClick && {
												onClick: () => onClick(item),
											})}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
