/**
 * Hook for managing FileUpload editor state
 * Inspired by sheets project's useFilePickerContent but adapted for reference-sheet pattern
 */

import { useMemo, useState, useCallback } from "react";
import { validateFileUpload } from "@/cell-level/renderers/fileUpload/utils/validateFileUpload";

interface FileUploadFile {
	url: string;
	size: number;
	mimeType: string;
}

interface UseFileUploadEditorProps {
	initialValue: FileUploadFile[] | null;
	onChange?: (value: FileUploadFile[] | null) => void;
	options?: {
		maxFileSizeBytes?: number;
		allowedFileTypes?: Array<{ extension: string }>;
		noOfFilesAllowed?: number;
	};
	fieldName?: string;
}

export function useFileUploadEditor({
	initialValue,
	onChange = () => {},
	options = {},
	fieldName = "",
}: UseFileUploadEditorProps) {
	// Validate initial value; if invalid, show blank
	const validatedInitialValue = useMemo(() => {
		const { isValid, processedValue } = validateFileUpload(initialValue);
		return isValid ? processedValue : null;
	}, [initialValue]);

	const [files, setFilesState] = useState<FileUploadFile[]>(
		validatedInitialValue || [],
	);
	// Track if the user actually edited anything; used to skip saving on no-op close
	const [hasUserEdited, setHasUserEdited] = useState(false);
	const [activeModal, setActiveModal] = useState<string | undefined>();
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [filesError, setFilesError] = useState<string>("");
	const [isFileUploadOpen, setIsFileUploadOpen] = useState<boolean>(false);

	/**
	 * Wrapper setter that also marks the editor as "dirty" when user changes files.
	 */
	const setFiles = useCallback(
		(value: FileUploadFile[] | ((prev: FileUploadFile[]) => FileUploadFile[])) => {
			setHasUserEdited(true);
			setFilesState(value);
		},
		[],
	);

	// Extract settings from options
	const settings = {
		maxFileSizeBytes: options?.maxFileSizeBytes ?? 10485760, // 10MB default
		allowedFileTypes: options?.allowedFileTypes ?? [],
		noOfFilesAllowed: options?.noOfFilesAllowed ?? 100,
	};

	// Handle file save - called on upload completion or file removal
	const handleFileSave = useCallback(
		(data: FileUploadFile[], upload = false, forceSave = false) => {
			// Only save if user actually edited (preserves errored data if no changes)
			// forceSave is used when we know the user made a change (e.g., upload)
			if (!forceSave && !hasUserEdited) {
				if (upload) {
					setActiveModal(undefined);
					setIsFileUploadOpen(false);
				} else if (data.length === 0) {
					setIsFileUploadOpen(false);
					setActiveModal(undefined);
				}
				return;
			}

			if (upload) {
				setActiveModal(undefined);
				setIsFileUploadOpen(false);
				onChange(data);
			} else {
				if (data.length === 0) {
					setIsFileUploadOpen(false);
					setActiveModal(undefined);
					onChange(data);
				} else {
					onChange(data);
				}
			}
		},
		[onChange, hasUserEdited],
	);

	// Close active modal and save files
	const closeActiveModal = useCallback(
		(filesToSave: FileUploadFile[]) => {
			setActiveModal(undefined);
			setIsFileUploadOpen(false);
			// Only save if user actually edited (preserves errored data if no changes)
			if (hasUserEdited) {
				onChange(filesToSave);
			}
		},
		[onChange, hasUserEdited],
	);

	return {
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
	};
}
