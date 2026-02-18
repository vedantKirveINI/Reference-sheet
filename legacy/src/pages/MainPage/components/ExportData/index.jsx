import { Icon } from "@/lib/oute-icon";
import React from "react";
import useExportData from "../../hooks/useExportData";

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
		<div className="mx-2">
			<div
				data-testid="export-data"
				className="flex gap-2 items-center text-white cursor-pointer"
				onClick={() => {
					onClick("CSV");
				}}
				ref={exportDataRef}
			>
				<Icon
					outeIconName="OUTEDownloadIcon"
					outeIconProps={{
						className: "text-white w-5 h-5 cursor-pointer",
					}}
				/>
				<span className="font-inter font-normal text-sm text-white">
					EXPORT AS CSV
				</span>
			</div>
		</div>
	);
}

export default ExportData;
