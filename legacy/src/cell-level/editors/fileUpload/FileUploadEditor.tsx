/**
 * FileUpload Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as StringEditor and SignatureEditor
 * Use this as a reference when creating new cell editors.
 *
 * KEY PATTERNS:
 * 1. SAVING LOGIC: onChange is called ONLY on save events (upload/close), NOT on every change
 *    - Local state updates immediately for UI feedback
 *    - Parent onChange is called only when saving
 *    - This prevents full page re-renders during editing
 *
 * 2. POSITIONING: Matches StringEditor's border alignment
 *    - width: rect.width + 4 (2px border on each side)
 *    - height: rect.height + 4 (2px border on top/bottom)
 *    - marginLeft/Top: -2 (aligns border with cell)
 *
 * 3. KEYBOARD HANDLING:
 *    - Enter: Save and navigate to next cell
 *    - Tab: Save and navigate
 *    - Escape: Cancel editing
 *
 * 4. BLUR HANDLING: Save on blur (focus out), but check if dialog is open
 *
 * 5. EVENT PROPAGATION: Stop propagation to prevent canvas scrolling/interaction
 *
 * 6. DIALOG: Opens immediately when entering edit mode
 */
import React, { useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { isEmpty } from "lodash";
import type { IFileUploadCell } from "@/types";
import { useFileUploadEditor } from "./hooks/useFileUploadEditor";
import { useFileUpload } from "@/pages/MainPage/components/FilePicker/hooks/useGetFileUploadUrl";
import FilePicker from "@/pages/MainPage/components/FilePicker";
import FileDialogHeader from "@/pages/MainPage/components/FilePicker/DialogHeader";
import { FileViewerContent } from "./components/FileViewerContent";
import { FileViewerFooter } from "./components/FileViewerFooter";
import styles from "./FileUploadEditor.module.css";

interface FileUploadEditorProps {
        cell: IFileUploadCell;
        rect: { x: number; y: number; width: number; height: number };
        theme: any;
        isEditing: boolean;
        onChange: (
                value: Array<{ url: string; size: number; mimeType: string }> | null,
        ) => void;
        onSave?: () => void;
        onCancel?: () => void;
        onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const FileUploadEditor: React.FC<FileUploadEditorProps> = ({
        cell,
        rect,
        theme,
        isEditing,
        onChange,
        onSave,
        onCancel,
        onEnterKey,
}) => {
        const containerRef = useRef<HTMLDivElement>(null);

        const initialValue = cell?.data || null;
        const options = cell?.options || {};

        const {
                files,
                setFiles,
                activeModal,
                setActiveModal,
                closeActiveModal,
                handleFileSave,
                settings,
                selectedFiles,
                setSelectedFiles,
                filesError,
                setFilesError,
                fieldName,
                isFileUploadOpen,
                setIsFileUploadOpen,
        } = useFileUploadEditor({
                initialValue,
                onChange: (value) => {
                        onChange(value);
                },
                options,
                fieldName: cell?.options?.fieldName || "",
        });

        const {
                uploadData,
                loading: apiLoading,
                error,
                uploadFiles,
                abortUpload,
        } = useFileUpload({
                files: selectedFiles,
        });

        // Open dialog immediately when entering edit mode
        useEffect(() => {
                if (isEditing) {
                        // Only set modal if not already set
                        if (!activeModal) {
                                const hasFiles = files && files.length > 0;

                                if (hasFiles) {
                                        setActiveModal("ViewModal");
                                } else {
                                        setActiveModal("UploadModal");
                                }
                                setIsFileUploadOpen(true);
                        }
                } else {
                        // Reset when not editing
                        if (activeModal) {
                                setActiveModal(undefined);
                                setIsFileUploadOpen(false);
                        }
                }
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isEditing]);

        // Handle cancel in upload modal
        const handleCancel = useCallback(() => {
                abortUpload();
                setSelectedFiles([]);
                closeActiveModal(files);
        }, [abortUpload, setSelectedFiles, closeActiveModal, files]);

        // Handle upload in upload modal
        const handleUpload = useCallback(async () => {
                const response = await uploadFiles();
                const newFiles = [...files, ...response];
                setFiles(newFiles);
                handleFileSave(newFiles, true, true); // true = upload completed, true = force save (user action)
                onSave?.();
        }, [uploadFiles, files, setFiles, handleFileSave, onSave]);

        /**
         * PATTERN: Keyboard event handler (matches StringEditor pattern)
         * - Enter: Save value and navigate to next cell
         * - Tab: Save value and navigate
         * - Escape: Cancel editing (discard changes)
         */
        const handleKeyDown = useCallback(
                (e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                // Close dialog and save
                                closeActiveModal(files);
                                onSave?.();
                                // Trigger navigation if onEnterKey is provided
                                if (onEnterKey) {
                                        requestAnimationFrame(() => {
                                                onEnterKey(e.shiftKey);
                                        });
                                }
                        } else if (e.key === "Tab") {
                                e.preventDefault();
                                e.stopPropagation();
                                // Close dialog and save
                                closeActiveModal(files);
                                onSave?.();
                                // Tab navigation would be handled by keyboard hook
                        } else if (e.key === "Escape") {
                                e.preventDefault();
                                e.stopPropagation();
                                // Cancel upload if in progress
                                abortUpload();
                                setSelectedFiles([]);
                                onCancel?.();
                        }
                },
                [
                        files,
                        closeActiveModal,
                        onSave,
                        onCancel,
                        onEnterKey,
                        abortUpload,
                        setSelectedFiles,
                ],
        );

        /**
         * PATTERN: Blur event handler (matches StringEditor pattern)
         * - Checks if dialog is open (don't close if it is)
         * - Saves value when focus moves outside editor and dialog is closed
         * - Uses setTimeout to check focus after event propagation
         */
        const handleBlur = useCallback(() => {
                // PATTERN: Use setTimeout to check focus after event propagation
                setTimeout(() => {
                        const activeElement = document.activeElement;
                        if (
                                containerRef.current &&
                                (containerRef.current === activeElement ||
                                        containerRef.current.contains(activeElement))
                        ) {
                                // Focus is still within editor, don't blur
                                return;
                        }

                        // If dialog is open, don't close editor on blur
                        if (isFileUploadOpen) {
                                return;
                        }

                        // Focus moved outside and dialog is closed, save and close
                        closeActiveModal(files);
                        onSave?.();
                }, 0);
        }, [files, closeActiveModal, onSave, isFileUploadOpen]);

        /**
         * PATTERN: Prevent blur during mouse interactions (matches StringEditor)
         * Stops event propagation to prevent canvas from handling the event
         */
        const handleMouseDown = useCallback((e: React.MouseEvent) => {
                e.stopPropagation(); // Prevent event bubbling to grid (like StringEditor)
                // Don't preventDefault - allow normal interactions within editor
        }, []);

        /**
         * PATTERN: Editor positioning and styling (matches StringEditor exactly)
         * - width + 4: Adds 4px for 2px border on each side
         * - height + 4: Adds 4px for 2px border on top/bottom
         * - marginLeft/Top -2: Offsets by border width to align border with cell
         * This ensures perfect alignment with the cell renderer
         */
        const editorStyle: React.CSSProperties = {
                position: "absolute",
                left: `${rect.x}px`,
                top: `${rect.y}px`,
                width: `${rect.width + 4}px`,
                height: `${rect.height + 4}px`,
                marginLeft: -2,
                marginTop: -2,
                zIndex: 1000,
                backgroundColor: theme.cellBackgroundColor,
                border: `2px solid ${theme.cellActiveBorderColor}`,
                borderRadius: "2px",
                padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
                boxSizing: "border-box",
                pointerEvents: "auto",
        };

        return (
                <>
                        <div
                                ref={containerRef}
                                className={styles.file_upload_container}
                                style={editorStyle}
                                onKeyDown={handleKeyDown}
                                onBlur={handleBlur}
                                onMouseDown={handleMouseDown}
                                tabIndex={-1}
                                data-testid="file-upload-editor"
                        >
                                {/* Invisible container - dialog handles all UI */}
                        </div>

                        {/* Upload Modal */}
                        <Dialog
                                open={activeModal === "UploadModal"}
                                onOpenChange={(open) => {
                                        if (!open) {
                                                setActiveModal(undefined);
                                                setIsFileUploadOpen(false);
                                        }
                                }}
                        >
                                <DialogContent
                                        style={{ maxWidth: "39rem" }}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onInteractOutside={(e) => e.preventDefault()}
                                >
                                        <DialogHeader>
                                                <DialogTitle asChild>
                                                        <FileDialogHeader title={fieldName || "File Upload"} />
                                                </DialogTitle>
                                        </DialogHeader>
                                        <FilePicker
                                                files={selectedFiles}
                                                setFiles={setSelectedFiles}
                                                uploadData={uploadData}
                                                loading={apiLoading}
                                                error={error}
                                                setFilesError={setFilesError}
                                                maxFileSizeBytes={settings.maxFileSizeBytes}
                                                settings={settings}
                                        />
                                        <DialogFooter>
                                                <div className={styles.actions}>
                                                        <Button
                                                                variant="outline"
                                                                onClick={handleCancel}
                                                        >
                                                                CANCEL
                                                        </Button>
                                                        <Button
                                                                disabled={
                                                                        apiLoading ||
                                                                        selectedFiles.length === 0 ||
                                                                        !isEmpty(filesError)
                                                                }
                                                                onClick={handleUpload}
                                                        >
                                                                UPLOAD
                                                        </Button>
                                                </div>
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>

                        {/* View Modal */}
                        <Dialog
                                open={activeModal === "ViewModal" && files.length > 0}
                                onOpenChange={(open) => {
                                        if (!open) closeActiveModal(files);
                                }}
                        >
                                <DialogContent
                                        style={{ maxWidth: "37.5rem" }}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        onInteractOutside={(e) => e.preventDefault()}
                                >
                                        <DialogHeader>
                                                <DialogTitle asChild>
                                                        <FileDialogHeader title={fieldName || "File Upload"} />
                                                </DialogTitle>
                                        </DialogHeader>
                                        <FileViewerContent
                                                files={files}
                                                setFiles={setFiles}
                                                onSave={(savedFiles) => {
                                                        setFiles(savedFiles);
                                                        handleFileSave(savedFiles, false, true);
                                                }}
                                        />
                                        <DialogFooter>
                                                <FileViewerFooter
                                                        onClose={() => closeActiveModal(files)}
                                                        onAddFiles={() => {
                                                                setActiveModal("UploadModal");
                                                                setIsFileUploadOpen(true);
                                                        }}
                                                />
                                        </DialogFooter>
                                </DialogContent>
                        </Dialog>
                </>
        );
};
