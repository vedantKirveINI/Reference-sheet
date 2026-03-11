import axios from "axios";
import { showAlert } from "oute-ds-alert";
import { serverConfig } from "oute-ds-utils";
import { useState, useRef } from "react";

import { uploadToPresignedUrl } from "./uploadToPresignedUrl"; // adjust the path

const BASE_URL = serverConfig.FILE_UPLOAD_SERVER;

function getToken() {
	return window.accessToken;
}

export function useFileUpload({ files }) {
	const [uploadData, setUploadData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	// Use a ref to store the controller so it can be modified without re-rendering the component
	const controllerRef = useRef(new AbortController());

	const uploadFiles = async () => {
		setLoading(true);
		setError(null);
		const results = [];
		const controller = controllerRef.current; // Get the controller from the ref

		try {
			for (const file of files) {
				const fileName = file?.name;
				const fileType = file?.name.split(".").pop();
				const fileSize = file?.size;

				try {
					// Step 1: Get pre-signed upload URL and CDN URL
					const { data } = await axios.post(
						`${BASE_URL}/upload`,
						{
							fileName,
							fileType,
						},
						{
							headers: {
								token: getToken(),
							},
							signal: controller.signal, // Pass the controller's signal to cancel the request
						},
					);

					const { upload: uploadUrl, cdn: cdnUrl } = data;

					// Step 2: Upload the actual file
					await uploadToPresignedUrl(
						uploadUrl,
						file,
						controller.signal,
					);

					// Step 3: Push the result
					results.push({
						url: cdnUrl,
						size: fileSize,
						mimeType: file?.type,
					});
				} catch (err) {
					if (err.name !== "AbortError") {
						console.error("Error uploading file:", fileName, err);
						setError(`Error uploading file: ${fileName}`);
						break;
					}
				}
			}

			// Show success toast message only if files are successfully uploaded
			if (results.length === files.length) {
				showAlert({
					type: "success",
					message: "Files uploaded successfully!",
				});
			}
			// Set the upload data once the upload process is complete
			setUploadData((prev) => results);
			return results;
		} finally {
			setLoading(false); // Ensure that loading is set to false when done
		}
	};

	// Expose the abort functionality
	const abortUpload = () => {
		controllerRef.current.abort(); // Cancel the ongoing requests
	};

	return { uploadData, loading, error, uploadFiles, abortUpload };
}
