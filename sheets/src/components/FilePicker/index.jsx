import { useCallback } from "react";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import DialogContent from "./DialogContent";
import { getDropzoneAcceptTypes } from "./utils/convertFileTypes.js";

function FilePicker(props) {
	const {
		files = [],
		setFiles,
		loading = false,
		error = {},
		maxFileSizeBytes = 10485760, // which is 10 Mb alway send this value in bytes
		setFilesError,
		settings = {},
	} = props;

	const { noOfFilesAllowed = 100 } = settings;

	const [errorMap, setErrorMap] = useState({});

	const onDrop = useCallback(
		(acceptedFiles) => {
			if (files.length + acceptedFiles.length > noOfFilesAllowed) {
				// If the number of files exceeds the limit, do not add new files
				return;
			}
			setFiles((prev) => [...prev, ...acceptedFiles]);
		},
		[setFiles, files, noOfFilesAllowed],
	);

	const removeFile = useCallback(
		(index) => {
			setFiles((prev) => prev.filter((_, i) => i !== index));
		},
		[setFiles],
	);

	const { getRootProps, getInputProps } = useDropzone({
		accept: getDropzoneAcceptTypes(settings?.allowedFileTypes),
		onDrop,
		multiple: noOfFilesAllowed > 1 ? true : false,
	});

	useEffect(() => {
		const newErrorMap = {};

		files?.forEach((file, index) => {
			if (file.size > maxFileSizeBytes) {
				newErrorMap[index] =
					`File exceeds the ${(maxFileSizeBytes / (1024 * 1024)).toFixed(2)} MB limit.`;
			}
		});

		setErrorMap(newErrorMap);
		setFilesError(newErrorMap);
	}, [files, maxFileSizeBytes, setFilesError]);

	return (
		<DialogContent
			getRootProps={getRootProps}
			getInputProps={getInputProps}
			files={files}
			removeFile={removeFile}
			loading={loading}
			error={error}
			errorMap={errorMap}
			noOfFilesAllowed={noOfFilesAllowed}
		/>
	);
}

export default FilePicker;
