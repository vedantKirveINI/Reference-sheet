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
import DialogHeaderComponent from "@/pages/MainPage/components/FilePicker/DialogHeader";
import { FileViewerContent } from "./components/FileViewerContent";
import { FileViewerFooter } from "./components/FileViewerFooter";

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

	useEffect(() => {
		if (isEditing) {
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
			if (activeModal) {
				setActiveModal(undefined);
				setIsFileUploadOpen(false);
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isEditing]);

	const handleCancel = useCallback(() => {
		abortUpload();
		setSelectedFiles([]);
		closeActiveModal(files);
	}, [abortUpload, setSelectedFiles, closeActiveModal, files]);

	const handleUpload = useCallback(async () => {
		const response = await uploadFiles();
		const newFiles = [...files, ...response];
		setFiles(newFiles);
		handleFileSave(newFiles, true, true);
		onSave?.();
	}, [uploadFiles, files, setFiles, handleFileSave, onSave]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter") {
				e.preventDefault();
				e.stopPropagation();
				closeActiveModal(files);
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				closeActiveModal(files);
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
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

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement))
			) {
				return;
			}

			if (isFileUploadOpen) {
				return;
			}

			closeActiveModal(files);
			onSave?.();
		}, 0);
	}, [files, closeActiveModal, onSave, isFileUploadOpen]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

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
				className="box-border outline-none flex flex-col h-full opacity-0 pointer-events-none"
				style={editorStyle}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				onMouseDown={handleMouseDown}
				tabIndex={-1}
				data-testid="file-upload-editor"
			>
			</div>

			<Dialog
				open={activeModal === "UploadModal"}
				onOpenChange={(v) => {
					if (!v) {
						setActiveModal(undefined);
						setIsFileUploadOpen(false);
					}
				}}
			>
				<DialogContent
					className="max-w-[39rem]"
					onKeyDown={(e) => e.stopPropagation()}
				>
					<DialogHeader>
						<DialogTitle asChild>
							<DialogHeaderComponent title={fieldName || "File Upload"} />
						</DialogTitle>
					</DialogHeader>
					<div className="p-0">
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
					</div>
					<div className="flex justify-end gap-3 p-4">
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
							variant="default"
							onClick={handleUpload}
						>
							UPLOAD
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog
				open={activeModal === "ViewModal" && files.length > 0}
				onOpenChange={(v) => {
					if (!v) closeActiveModal(files);
				}}
			>
				<DialogContent
					className="max-w-[37.5rem]"
					onKeyDown={(e) => e.stopPropagation()}
				>
					<DialogHeader>
						<DialogTitle asChild>
							<DialogHeaderComponent title={fieldName || "File Upload"} />
						</DialogTitle>
					</DialogHeader>
					<div className="p-0">
						<FileViewerContent
							files={files}
							setFiles={setFiles}
							onSave={(savedFiles) => {
								setFiles(savedFiles);
								handleFileSave(savedFiles, false, true);
							}}
						/>
					</div>
					<FileViewerFooter
						onClose={() => closeActiveModal(files)}
						onAddFiles={() => {
							setActiveModal("UploadModal");
							setIsFileUploadOpen(true);
						}}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
