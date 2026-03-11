// Signature Renderer for Kanban Cards
import React, { useState } from "react";
import type { ICell, IColumn } from "@/types";
import styles from "./SignatureRenderer.module.scss";

interface SignatureRendererProps {
	cell: ICell;
	column: IColumn;
}

export const SignatureRenderer: React.FC<SignatureRendererProps> = ({
	cell,
}) => {
	// Get signature URL from data or displayData
	const signatureUrl = (cell.data || cell.displayData) as string | null;

	if (!signatureUrl) {
		return null;
	}

	const [imageError, setImageError] = useState(false);

	if (imageError) {
		// If image fails to load, show a placeholder or nothing
		return null;
	}

	return (
		<div className={styles.signatureContainer}>
			<img
				src={signatureUrl}
				alt="Signature"
				className={styles.signatureImage}
				onError={() => setImageError(true)}
			/>
		</div>
	);
};
