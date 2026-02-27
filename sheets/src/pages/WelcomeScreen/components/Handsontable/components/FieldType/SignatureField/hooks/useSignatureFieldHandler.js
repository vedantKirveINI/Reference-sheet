import { showAlert } from "oute-ds-alert";
import { useState, useRef } from "react";

export default function useSignatureFieldHandler({ value, onChange }) {
	const [open, setOpen] = useState(false);
	const [signatureImage, setSignatureImage] = useState(value);
	const [loading, setLoading] = useState(false);
	const signatureRef = useRef(null);

	const handleClick = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleSignatureChange = (data) => {
		setSignatureImage(data);
	};

	const handleSave = async () => {
		const isSignatureEmpty = signatureRef.current?.isEmpty();
		const isValidSignature = signatureRef.current?.validateSignature();

		if (isSignatureEmpty) {
			onChange(null);
			handleClose();
			return;
		}

		if (!isValidSignature) {
			showAlert({
				type: "error",
				message: "Invalid signature",
			});
			return;
		}

		try {
			setLoading(true);
			const uploadedSignatureUrl =
				await signatureRef.current?.uploadSignature();
			onChange(uploadedSignatureUrl);
		} catch (error) {
			console.log("Error uploading signature:", error);
			showAlert({
				type: "error",
				message: "Failed to upload signature. Please try again.",
			});
		} finally {
			setLoading(false);
			handleClose();
		}
	};

	return {
		open,
		setOpen,
		signatureImage,
		setSignatureImage,
		loading,
		signatureRef,
		handleClick,
		handleClose,
		handleSignatureChange,
		handleSave,
	};
}
