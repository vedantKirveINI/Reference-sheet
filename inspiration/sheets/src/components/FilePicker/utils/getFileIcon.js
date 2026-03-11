export function getFileIcon(mime = "") {
	switch (mime) {
		case "image/svg+xml":
			return "ImageIcon"; // SVG
		case "image/png":
			return "ImageIcon"; // PNG
		case "image/jpeg":
		case "image/jpg":
			return "ImageIcon"; // JPEG
		case "image/webp":
			return "ImageIcon"; // WEBP

		case "application/pdf":
			return "PdfIcon"; // PDF

		case "application/msword":
		case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
			return "DocIcon"; // Word

		case "text/csv":
		case "application/vnd.ms-excel":
		case "text/x-csv":
		case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
		case "application/vnd.ms-excel.sheet.macroEnabled.12":
			return "XlsxIcon"; // CSV/Excel

		// Archives
		case "application/zip":
		case "application/x-rar-compressed":
		case "application/x-7z-compressed":
			return "ZipIcon";

		// Audio
		case "audio/mpeg":
		case "audio/wav":
		case "audio/ogg":
			return "AudioIcon";

		// Video
		case "video/mp4":
		case "video/webm":
		case "video/x-msvideo":
			return "VideoIcon";

		// Default for unknown types
		default:
			if (mime.startsWith("image/")) return "ImageIcon";
			if (mime.includes("word")) return "DocIcon";
			if (mime.includes("excel")) return "XlsxIcon";
			if (
				mime.includes("zip") ||
				mime.includes("rar") ||
				mime.includes("7z")
			)
				return "ZipIcon";
			if (mime.includes("audio")) return "AudioIcon";
			if (mime.includes("video")) return "VideoIcon";
			return "DocIcon"; // Default to DocIcon
	}
}
