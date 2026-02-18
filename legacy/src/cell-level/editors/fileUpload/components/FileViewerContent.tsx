/**
 * FileViewerContent Component
 * Displays list of uploaded files with actions (view, download, remove)
 * Inspired by sheets project's FileViewerContent
 */

import React from "react";
import ODSIcon from "@/lib/oute-icon";
import { getFileIcon } from "@/pages/MainPage/components/FilePicker/utils/getFileIcon";
import { useFileViewerContentHandler } from "../hooks/useFileViewerContentHandler";
import { getIconMapping } from "../utils/getIconMapping";
import { convertBytes } from "../utils/convertBytes";

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

function getFileNameFromUrl(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const fileName = pathname.split("/").pop() || "";
		return decodeURIComponent(fileName);
	} catch (e) {
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
			<div className="flex justify-between items-center p-4 border-b border-[#e0e0e0]">
				<div>Total</div>
				<div className="font-semibold text-[#212121]">
					{files?.length} file{files?.length !== 1 ? "s" : ""}
				</div>
			</div>

			<div className="flex flex-col max-h-[400px] overflow-y-auto">
				{(files || []).map((item, index) => {
					const fileSize = item?.size
						? convertBytes({ bytes: item.size })
						: "-";

					const fileName = getFileNameFromUrl(item?.url) || "";

					return (
						<div
							className="flex justify-between items-center py-3 px-4 border-b border-[#f5f5f5] hover:bg-[#fafafa]"
							key={`${item?.url}_${index}`}
							data-testid={`file-viewer-${index}`}
						>
							<div className="flex items-center gap-3 flex-1 min-w-0">
								<ODSIcon
									outeIconName={getFileIcon(item?.mimeType)}
									outeIconProps={{
										className: "w-8 h-8 text-[#212121]",
									}}
								/>

								<span className="flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[#212121] text-sm">
									{fileName || "-"}
								</span>

								<span className="text-[#757575] text-sm whitespace-nowrap">
									{fileSize}
								</span>
							</div>

							<div className="flex items-center gap-2 ml-2">
								{iconMapping.map((icon) => {
									const { name, iconProp, onClick } = icon;
									return (
										<ODSIcon
											key={name}
											outeIconProps={{
												className: "text-[#90A4AE] w-6 h-6 cursor-pointer",
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
