import axios from "axios";
import { showAlert } from "@/lib/toast";

export async function uploadToPresignedUrl(url, file, signal) {
	try {
		await axios.put(url, file, {
			headers: {
				"Content-Type": file.type,
			},
			maxContentLength: Infinity,
			maxBodyLength: Infinity,
			signal,
		});
	} catch (err) {
		if (err.name === "AbortError") {
			showAlert({
				type: "error",
				message: "File Uploading was cancelled",
			});
		} else {
			showAlert({
				type: "error",
				message: "Error uploading filed",
			});
		}
	}
}
