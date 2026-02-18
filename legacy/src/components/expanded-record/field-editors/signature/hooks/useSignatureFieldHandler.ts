import { showAlert } from "@/lib/toast";
import { useState, useRef, useEffect } from "react";

interface UseSignatureFieldHandlerProps {
        value: unknown;
        onChange: (newValue: unknown) => void;
        readonly?: boolean;
}

export default function useSignatureFieldHandler({
        value,
        onChange,
        readonly = false,
}: UseSignatureFieldHandlerProps) {
        const [open, setOpen] = useState(false);
        const [signatureImage, setSignatureImage] = useState<string>(
                (value as string) || "",
        );
        const [loading, setLoading] = useState(false);
        const signatureRef = useRef<any>(null);

        // Sync signatureImage when value changes externally
        useEffect(() => {
                setSignatureImage((value as string) || "");
        }, [value]);

        const handleClick = () => {
                if (readonly) return;
                setOpen(true);
        };

        const handleClose = () => {
                setOpen(false);
                // Reset to original value when closing without saving
                setSignatureImage((value as string) || "");
        };

        const handleSignatureChange = (data: string) => {
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
                } catch {
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
                signatureImage,
                loading,
                signatureRef,
                handleClick,
                handleClose,
                handleSignatureChange,
                handleSave,
        };
}
