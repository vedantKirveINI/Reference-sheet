export const mimeTypeToExtension = {
  // Documents
  "application/msword": "doc", // .doc (Microsoft Word)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx", // .docx (Microsoft Word Open XML)
  "application/pdf": "pdf", // .pdf (Portable Document Format)
  "text/plain": "txt", // .txt (Plain Text)

  // Spreadsheets
  "application/vnd.ms-excel": "xls", // .xls (Microsoft Excel)
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx", // .xlsx (Microsoft Excel Open XML)
  "text/csv": "csv", // .csv (Comma-Separated Values)

  // Images
  "image/jpg": "jpg", // .jpg (JPEG Image)
  "image/jpeg": "jpeg", // .jpeg (JPEG Image)
  "image/png": "png", // .png (Portable Network Graphics)
  "image/gif": "gif", // .gif (Graphics Interchange Format)
  "image/bmp": "bmp", // .bmp (Bitmap Image)
  "image/svg+xml": "svg", // .svg (Scalable Vector Graphics)

  // Compressed Files
  "application/zip": "zip", // .zip (ZIP archive)
  "application/x-rar-compressed": "rar", // .rar (RAR archive)
  "application/vnd.rar": "rar", // .rar (RAR archive)
  "application/x-tar": "tar", // .tar.gz (Tarbell compressed with gzip)
  "application/gzip": "tgz", // .gz (Tarbell compressed with gzip)
  "application/x-gtar": "tgz", // .tgz (Tarbell compressed with gzip)
  "application/x-7z-compressed": "7z", // .7z (7-Zip archive)
  "application/octet-stream": "7z",
  "application/x-zip-compressed": "zip", // .zip (ZIP archive)
  "application/x-gzip": "tgz", // .tgz,
  "application/x-rar": "rar", // .rar (RAR archive)
  "application/x-compressed": ["7z", "rar", "tgz", "zip"], // Multiple possible extensions for Windows
  "application/x-zip": "zip",
  "multipart/x-zip": "zip",
  "application/x-compress": "zip",
  "application/x-ustar": "tar",
  "application/x-lzh-compressed": "lzh",
  "application/x-gzip-compressed": "gz",
  "application/gz": "gz",
  "application/x-tgz": "tgz",
  "application/x-compressed-tar": "tgz",
  "application/x-tar-gz": "tgz",
};
