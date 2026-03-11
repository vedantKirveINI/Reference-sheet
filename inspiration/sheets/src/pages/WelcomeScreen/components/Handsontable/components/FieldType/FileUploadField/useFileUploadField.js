import isEmpty from "lodash/isEmpty";
import { useState, useCallback, useMemo } from "react";

import { useFileUpload } from "../../../../../../../components/FilePicker/hooks/useGetFileUploadUrl";

const useFileUploadField = ({ value = "[]", onChange }) => {
	// Memoize parsed value to avoid repeated JSON parsing
	const parsedValue = useMemo(() => {
		try {
			return JSON.parse(value || "[]");
		} catch (err) {
			console.error("Error parsing value:", err);
			return [];
		}
	}, [value]);

	const [open, setOpen] = useState(false);
	const [files, setFiles] = useState([]);
	const [fileExisting, setFileExisting] = useState(parsedValue || []);
	const [error, setError] = useState(null);

	const {
		loading,
		error: uploadError,
		uploadFiles,
	} = useFileUpload({ files });

	const handleClick = useCallback(() => {
		setOpen((prev) => !prev);
	}, []);

	const onClose = useCallback(() => {
		setOpen((prev) => !prev);
		setFiles([]);
		setError(null);
	}, []);

	const handleCancel = useCallback(() => {
		setOpen((prev) => !prev);
		setFiles([]);
		setError(null);
	}, []);

	const handleUpload = useCallback(async () => {
		try {
			const response = await uploadFiles();
			const newValue = [...fileExisting, ...response];

			setFileExisting((prev) => [...prev, ...response]);
			onChange(JSON.stringify(newValue));
			onClose();
		} catch (err) {
			setError(err);
			console.error("Upload error:", err);
		}
	}, [uploadFiles, fileExisting, onChange, onClose]);

	const onRemoveFile = useCallback(
		(remainingFiles) => {
			try {
				onChange(JSON.stringify(remainingFiles));
			} catch (err) {
				console.error("Error updating files after removal:", err);
				setError(err);
			}
		},
		[onChange],
	);

	const isUploadDisabled = useMemo(
		() => loading || files.length === 0 || !isEmpty(error),
		[loading, files.length, error],
	);

	return {
		open,
		files,
		error,
		loading,
		uploadError,
		isUploadDisabled,
		handleClick,
		onClose,
		handleCancel,
		handleUpload,
		setFiles,
		setError,
		onRemoveFile,
		fileExisting,
		setFileExisting,
	};
};

export default useFileUploadField;
