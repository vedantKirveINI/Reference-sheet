import { Download } from "lucide-react";
import React from "react";
import useExportData from "../../hooks/useExportData";

import styles from "./styles.module.scss";

function ExportData({
	viewId = "",
	tableId = "",
	baseId = "",
	tableListData = [],
}) {
	const { exportDataRef, onClick } = useExportData({
		viewId,
		tableId,
		baseId,
		tableListData,
	});

	return (
		<div className={styles.container}>
			<div
				data-testid="export-data"
				className={styles.export_container}
				onClick={() => {
					onClick("CSV");
				}}
				ref={exportDataRef}
			>
				<Download
					style={{
						color: "#fff",
						width: "1.25rem",
						height: "1.25rem",
						cursor: "pointer",
					}}
				/>
				<span
					style={{
						fontFamily: "Inter",
						fontWeight: "400",
						fontSize: "0.875rem",
						color: "#fff",
					}}
				>
					EXPORT AS CSV
				</span>
			</div>
		</div>
	);
}

export default ExportData;
