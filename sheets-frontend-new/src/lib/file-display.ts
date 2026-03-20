import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type FileLike = {
  name?: string;
  type?: string;
  fileType?: string;
  mimeType?: string;
  url?: string;
  fileUrl?: string;
  cdn?: string;
  cdnUrl?: string;
  downloadUrl?: string;
  path?: string;
};

const IMAGE_EXTENSIONS = new Set(["svg", "png", "jpg", "jpeg", "webp", "gif", "bmp", "tiff"]);
const DOC_EXTENSIONS = new Set(["doc", "docx", "odt", "rtf", "txt"]);
const SHEET_EXTENSIONS = new Set(["csv", "xls", "xlsx", "ods"]);
const ARCHIVE_EXTENSIONS = new Set(["zip", "rar", "7z", "tar", "gz"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "aac"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "avi", "mov", "mkv"]);

function getFileExtensionFromText(name?: string): string {
  if (!name || !name.includes(".")) return "";
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function getFileUrl(file: FileLike): string {
  return file.url || file.fileUrl || file.cdnUrl || file.cdn || file.downloadUrl || file.path || "";
}

function getFileExtension(file: FileLike): string {
  const fromName = getFileExtensionFromText(file.name);
  if (fromName) return fromName;

  const url = getFileUrl(file);
  if (!url) return "";
  const withoutQuery = url.split("?")[0];
  const fromUrl = getFileExtensionFromText(withoutQuery.split("/").pop() || "");
  return fromUrl;
}

function isPdf(file: FileLike): boolean {
  const mime = (file.type || file.fileType || file.mimeType || "").toLowerCase();
  const ext = getFileExtension(file);
  return mime === "application/pdf" || ext === "pdf";
}

export function resolveFileTypeIcon(file: FileLike): LucideIcon {
  const mime = (file.type || file.fileType || file.mimeType || "").toLowerCase();
  const ext = getFileExtension(file);

  if (isPdf(file)) return FileText;
  if (mime.startsWith("image/") || IMAGE_EXTENSIONS.has(ext)) return FileImage;

  if (
    mime === "text/csv" ||
    mime === "application/vnd.ms-excel" ||
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mime.includes("excel") ||
    SHEET_EXTENSIONS.has(ext)
  ) {
    return FileSpreadsheet;
  }

  if (
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime.includes("word") ||
    DOC_EXTENSIONS.has(ext)
  ) {
    return FileText;
  }

  if (mime.includes("zip") || mime.includes("rar") || mime.includes("7z") || ARCHIVE_EXTENSIONS.has(ext)) {
    return FileArchive;
  }
  if (mime.startsWith("audio/") || AUDIO_EXTENSIONS.has(ext)) return FileAudio;
  if (mime.startsWith("video/") || VIDEO_EXTENSIONS.has(ext)) return FileVideo;

  return File;
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileNameFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname || "";
    const name = pathname.split("/").pop() || "";
    return decodeURIComponent(name);
  } catch {
    const pathname = (url || "").split("?")[0];
    return decodeURIComponent(pathname.split("/").pop() || "");
  }
}

export async function downloadFileFromUrl(file: FileLike): Promise<void> {
  const url = getFileUrl(file);
  if (!url) throw new Error("Invalid file URL");

  // Use a direct anchor click so browser treats this as user-initiated download/open.
  // Async fetch/blob flows can lose gesture context and be blocked in some setups.
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name || getFileNameFromUrl(url) || "download";
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
