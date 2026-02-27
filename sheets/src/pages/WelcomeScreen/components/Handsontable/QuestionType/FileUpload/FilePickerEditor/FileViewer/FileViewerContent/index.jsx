import Icon from "oute-ds-icon";
import React from "react";

import { getFileIcon } from "../../../../../../../../../components/FilePicker/utils/getFileIcon";
import getFileNameFromUrl from "../../../../../../../../../utils/getFileNameFromUrl";
import convertBytes from "../../../../../../../../../utils/sizeConversion";
import getIconMapping from "../../../config/getIconMapping";
import useFileViewContentHandler from "../../hooks/useFileViewContentHandler";
import styles from "../styles.module.scss";

const FileViewerContent = ({
	files = [],
	setFiles = () => {},
	onSave = () => {},
	source = "",
}) => {
	const {
		handleFileView = () => {},
		downloadFile = () => {},
		handleFileRemove = () => {},
	} = useFileViewContentHandler({ files, setFiles, onSave });

	const iconMapping = getIconMapping({
		handleFileRemove,
		handleFileView,
		downloadFile,
	});

	return (
		<div data-testid="file-viewer-container">
			<div
				className={`${styles.total_files_container} ${source ? styles.total_files_container_field : ""}`}
			>
				<div>Total</div>
				<div className={styles.total_files_count}>
					{files?.length} file{files?.length !== 1 ? "(s)" : ""}
				</div>
			</div>

			<div
				className={`${styles.file_picker_content} ${source ? styles.file_picker_content_field : ""}`}
			>
				{(files || [])?.map((item, index) => {
					const fileSize = item?.size
						? convertBytes({ bytes: item.size })
						: "-";

					const fileName = getFileNameFromUrl(item?.url) || "";

					return (
						<div
							className={styles.file_upload_container}
							key={`${item?.url}_${index}`}
							data-testid={`file-viewer-${index}`}
						>
							<div className={styles.file_info_container}>
								<Icon
									outeIconName={getFileIcon(item?.mimeType)}
									outeIconProps={{
										sx: {
											width: "32px",
											height: "32px",
											color: "#212121",
										},
									}}
								/>

								<span className={styles.file_url}>
									{fileName || "-"}
								</span>

								<span
									className={
										styles.file_upload_size_container
									}
								>
									{fileSize}
								</span>
							</div>

							<div
								className={
									styles.file_upload_action_icons_container
								}
							>
								{iconMapping.map((icon) => {
									const { name, iconProp, onClick } = icon;
									return (
										<Icon
											key={name}
											outeIconProps={{
												sx: {
													color: "#90A4AE",
													width: "24px",
													height: "24px",
													cursor: "pointer",
												},
											}}
											{...iconProp}
											{...(onClick && {
												onClick: () => onClick(item),
											})}
										/>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default FileViewerContent;
