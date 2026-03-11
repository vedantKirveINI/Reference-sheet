import axios from "axios";
import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";

import getFileNameFromUrl from "../../../../../../../../utils/getFileNameFromUrl";
import truncateName from "../../../../../../../../utils/truncateName";

const handleFileView = (file) => {
	const { url } = file || {};

	window.open(url, "_blank", "noopener, noreferrer");
};

const downloadFile = (file) => {
	if (isEmpty(file)) return;
	const fileName = getFileNameFromUrl(file?.url) || "";

	generateFileBlob(file)
		.then((blob) => {
			if (!blob) {
				throw new Error("Invalid blob data");
			}

			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");

			link.href = url;
			link.download = fileName;
			document.body.appendChild(link);

			link.click();

			document.body.removeChild(link);
			URL.revokeObjectURL(url);
		})
		.catch((error) => {
			showAlert({
				type: "error",
				message:
					truncateName(error?.message, 50) ||
					"Could not download file",
			});
		});
};

const generateFileBlob = (file) => {
	const { url } = file || {};

	if (!url) {
		return Promise.reject(new Error("Invalid file URL"));
	}

	return axios
		.get(url, { responseType: "blob" })
		.then((response) => response.data)
		.catch((error) => {
			return Promise.reject(error?.message || "Failed to fetch file");
		});
};

function useFileViewerContentHandler({
	files = [],
	setFiles = () => {},
	onSave = () => {},
}) {
	const handleFileRemove = (removefile) => {
		const remainingFiles = files.filter(
			(item) => removefile?.url !== item?.url,
		);

		setFiles(() => remainingFiles);
		onSave(remainingFiles);

		showAlert({
			type: "success",
			message: "File removed successfully",
		});
	};

	return {
		downloadFile,
		handleFileView,
		handleFileRemove,
	};
}

export default useFileViewerContentHandler;
