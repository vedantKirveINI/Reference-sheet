import React from "react";
import { Button } from "@/components/ui/button";

interface FileViewerFooterProps {
	onClose: () => void;
	onAddFiles: () => void;
}

export const FileViewerFooter: React.FC<FileViewerFooterProps> = ({
	onClose,
	onAddFiles,
}) => {
	return (
		<div className="flex justify-end gap-3 p-4">
			<Button
				variant="outline"
				onClick={onClose}
			>
				CLOSE
			</Button>
			<Button variant="default" onClick={onAddFiles}>ADD MORE</Button>
		</div>
	);
};
