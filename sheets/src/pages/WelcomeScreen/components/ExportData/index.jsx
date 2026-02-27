import Icon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
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
				<Icon
					outeIconName="OUTEDownloadIcon"
					outeIconProps={{
						sx: {
							color: "#fff",
							width: "1.25rem",
							height: "1.25rem",
							cursor: "pointer",
						},
					}}
				/>
				<ODSLabel
					variant="subtitle2"
					sx={{ fontFamily: "Inter", fontWeight: "400" }}
					color="#fff"
				>
					EXPORT AS CSV
				</ODSLabel>
			</div>
		</div>
	);
}

export default ExportData;
