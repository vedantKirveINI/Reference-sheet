import React, { useState } from "react";
import ODSIcon from "@/lib/oute-icon";
import type { ICell, IColumn } from "@/types";
import { getFileIcon } from "@/cell-level/renderers/fileUpload/utils/getFileIcon";

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
		return (
			<div className="w-10 h-10 rounded overflow-hidden shrink-0 bg-[#f5f5f5] flex items-center justify-center">
				<img
					src={file.url}
					alt="File preview"
					className="w-full h-full object-cover block"
					onError={() => setImageError(true)}
				/>
			</div>
		);
	}

	return (
		<div className="w-10 h-10 flex items-center justify-center bg-[#f5f5f5] rounded shrink-0">
			<ODSIcon
				outeIconName={getFileIcon(file.mimeType || "")}
				outeIconProps={{
					size: 32,
					className: "text-[#666]",
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
		<div className="flex items-center gap-1 flex-wrap">
			{files.map((file: any, index: number) => (
				<FileItem key={index} file={file} />
			))}
		</div>
	);
};
