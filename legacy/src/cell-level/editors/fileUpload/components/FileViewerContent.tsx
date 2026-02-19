/**
 * FileViewerContent Component
 * Displays list of uploaded files with actions (view, download, remove)
 * Inspired by sheets project's FileViewerContent
 */

import React from "react";
import { Eye, Download, Trash2, FileText, FileImage, FileVideo, FileAudio, File } from "lucide-react";
import { useFileViewerContentHandler } from "../hooks/useFileViewerContentHandler";
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

function getFileIconComponent(mimeType: string) {
        if (!mimeType) return File;
        if (mimeType.startsWith("image/")) return FileImage;
        if (mimeType.startsWith("video/")) return FileVideo;
        if (mimeType.startsWith("audio/")) return FileAudio;
        if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return FileText;
        return File;
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

        const actionIcons = [
                { name: "view", Icon: Eye, onClick: handleFileView, testId: "view-icon" },
                { name: "download", Icon: Download, onClick: downloadFile, testId: "download-icon" },
                { name: "close", Icon: Trash2, onClick: handleFileRemove, testId: "delete-icon" },
        ];

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
                                        const FileIcon = getFileIconComponent(item?.mimeType);

                                        return (
                                                <div
                                                        className={styles.file_upload_container}
                                                        key={`${item?.url}_${index}`}
                                                        data-testid={`file-viewer-${index}`}
                                                >
                                                        <div className={styles.file_info_container}>
                                                                <FileIcon
                                                                        className="text-[#212121]"
                                                                        style={{ width: "32px", height: "32px" }}
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
                                                                {actionIcons.map(({ name, Icon, onClick, testId }) => (
                                                                        <button
                                                                                key={name}
                                                                                onClick={() => onClick(item)}
                                                                                className="p-0 border-0 bg-transparent cursor-pointer"
                                                                                data-testid={testId}
                                                                        >
                                                                                <Icon className="h-6 w-6 text-[#90A4AE] cursor-pointer" />
                                                                        </button>
                                                                ))}
                                                        </div>
                                                </div>
                                        );
                                })}
                        </div>
                </div>
        );
};
