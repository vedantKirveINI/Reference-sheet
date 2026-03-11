import { useState, useRef, useEffect } from "react";
import { showAlert } from "oute-ds-alert";

interface UseSignatureEditorProps {
	initialValue?: string | null;
	onChange?: (value: string | null) => void;
	close?: () => void;
}

interface SignatureRef {
	isEmpty: () => boolean;
	uploadSignature: () => Promise<string>;
}

export function useSignatureEditor(props: UseSignatureEditorProps = {}) {
	const { initialValue = "", onChange = () => {}, close = () => {} } = props;

	const signatureRef = useRef<SignatureRef | null>(null);

	const [signatureImage, setSignatureImage] = useState<string>(
		initialValue || "",
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [isExpanded, setIsExpanded] = useState<string>("");
	const [imageLoading, setImageLoading] = useState<boolean>(false);
	const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(
		initialValue || null,
	);

	// Update currentImageUrl when initialValue changes (from cell prop)
	useEffect(() => {
		if (initialValue && initialValue !== currentImageUrl) {
			setCurrentImageUrl(initialValue);
			// Set loading state when URL changes (only if it's a new URL)
			setImageLoading(true);
		} else if (!initialValue && currentImageUrl) {
			setCurrentImageUrl(null);
			setImageLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialValue]);

	const openDialog = () => {
		setIsExpanded("open_dialog");
	};

	const closeDialog = () => {
		setIsExpanded("");
		close();
	};

	const onSave = async () => {
		const isSignatureEmpty = signatureRef.current?.isEmpty() ?? true;

		if (isSignatureEmpty) {
			onChange(null);
			closeDialog();
			return;
		}

		try {
			setLoading(true);
			setImageLoading(true); // Start image loading state

			const uploadedSignatureUrl =
				await signatureRef.current?.uploadSignature();

			if (uploadedSignatureUrl) {
				// Update local state immediately to show new image
				setCurrentImageUrl(uploadedSignatureUrl);
				setSignatureImage(uploadedSignatureUrl);
				setImageLoading(true); // Set loading state for new image
				// Call onChange to update parent/cell
				onChange(uploadedSignatureUrl);
			}
		} catch {
			showAlert({
				type: "error",
				message: "Failed to upload signature. Please try again.",
			});
		} finally {
			setLoading(false);
			closeDialog();
		}
	};

	const handleSignatureChange = (data: string) => {
		setSignatureImage(data);
	};

	const handleImageLoad = () => {
		setImageLoading(false);
	};

	const handleImageError = () => {
		setImageLoading(false);
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
		currentImageUrl,
		imageLoading,
		handleImageLoad,
		handleImageError,
	};
}
