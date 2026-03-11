import { useState } from "react";

import validateFileUpload from "../../utils/validateFileUpload";

function useFilePickerContent(props) {
	const {
		initialValue = "",
		onChange = () => {},
		cellProperties = {},
		setIsFileUploadOpen,
	} = props;

	const { newValue: validValue = [] } = validateFileUpload(initialValue);

	const { fieldInfo = {} } = cellProperties?.cellProperties || {};

	const { options: settings = {}, name: fieldName = "" } = fieldInfo || {};

	const [files, setFiles] = useState(validValue || []);
	const [activeModal, setActiveModal] = useState();
	const [selectedfiles, setSelectedFiles] = useState([]);
	const [filesError, setFilesError] = useState("");

	const handleFileSave = (data, upload = false) => {
		if (upload) {
			setActiveModal(undefined);
			setIsFileUploadOpen(false);

			onChange(JSON.stringify(data));
		} else {
			if (data.length === 0) {
				setIsFileUploadOpen(false);
				setActiveModal();
				onChange(JSON.stringify(data));
			} else {
				onChange(JSON.stringify(data));
			}
		}
	};

	const closeActiveModal = ({ files }) => {
		setActiveModal();
		setIsFileUploadOpen(false);
		onChange(JSON.stringify(files));
	};

	return {
		activeModal,
		setActiveModal,
		closeActiveModal,
		files,
		setFiles,
		handleFileSave,
		settings,
		selectedfiles,
		setSelectedFiles,
		setFilesError,
		filesError,
		fieldName,
	};
}

export default useFilePickerContent;
