import { showAlert } from "oute-ds-alert";
import { useState, useRef } from "react";

function useSignatureEditor(props) {
	const {
		initialValue = "",
		onChange = () => {},
		setShow = () => {},
		close = () => {},
	} = props || {};

	const signatureRef = useRef(null);

	const [signatureImage, setSignatureImage] = useState(initialValue);
	const [loading, setLoading] = useState();
	const [isExpanded, setIsExpanded] = useState();

	const openDialog = () => {
		setIsExpanded(() => "open_dialog");
		setShow(true);
	};

	const closeDialog = () => {
		setIsExpanded("");
		setShow(false);
		close();
	};

	const onSave = async () => {
		const isSignatureEmpty = signatureRef.current?.isEmpty();
		const isValidSignature = signatureRef.current?.validateSignature();

		if (isSignatureEmpty) {
			onChange(null);
			closeDialog();
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
			closeDialog();
		}
	};

	const handleSignatureChange = (data) => {
		setSignatureImage(() => data);
	};

	return {
		signatureImage,
		signatureRef,
		isExpanded,
		handleSignatureChange,
		setIsExpanded,
		onSave,
		loading,
		openDialog,
		closeDialog,
	};
}

export default useSignatureEditor;
