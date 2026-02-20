import { useCallback } from "react";
import axios from "axios";
import { showAlert } from "oute-ds-alert";

interface FileUploadFile {
	url: string;
	size: number;
	mimeType: string;
}

interface UseFileViewerContentHandlerProps {
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

// Truncate name helper
function truncateName(name: string, maxLength: number): string {
	if (name.length <= maxLength) return name;
	return name.substring(0, maxLength - 3) + "...";
}

// Generate file blob for download
async function generateFileBlob(file: FileUploadFile): Promise<Blob> {
	const { url } = file || {};

	if (!url) {
		throw new Error("Invalid file URL");
	}

	try {
		const response = await axios.get(url, { responseType: "blob" });
		return response.data;
	} catch (error: any) {
		throw new Error(error?.message || "Failed to fetch file");
	}
}

export function useFileViewerContentHandler({
	files,
	setFiles,
	onSave,
}: UseFileViewerContentHandlerProps) {
	// Open file in new tab
	const handleFileView = useCallback((file: FileUploadFile) => {
		const { url } = file || {};
		if (url) {
			window.open(url, "_blank", "noopener, noreferrer");
		}
	}, []);

	// Download file
	const downloadFile = useCallback(async (file: FileUploadFile) => {
		if (!file) return;

		const fileName = getFileNameFromUrl(file?.url) || "";

		try {
			const blob = await generateFileBlob(file);
			if (!blob) {
				throw new Error("Invalid blob data");
			}

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");

			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);

			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		} catch (error: any) {
			showAlert({
				type: "error",
				message:
					truncateName(error?.message, 50) ||
					"Could not download file",
			});
		}
	}, []);

	// Remove file
	const handleFileRemove = useCallback(
		(removeFile: FileUploadFile) => {
			const remainingFiles = files.filter(
				(item) => removeFile?.url !== item?.url,
			);

			setFiles(remainingFiles);
			onSave(remainingFiles);

			showAlert({
				type: "success",
				message: "File removed successfully",
			});
		},
		[files, setFiles, onSave],
	);

	return {
		handleFileView,
		downloadFile,
		handleFileRemove,
	};
}
