import isEmpty from "lodash/isEmpty";
import { FileText, FileImage, FileVideo, FileArchive, File } from "lucide-react";
import { useRef } from "react";
import { useEffect } from "react";

import truncateName from "../../../../../../utils/truncateName";
import convertBytes from "../../../../../../utils/sizeConversion";
import { getFileIcon } from "../../utils/getFileIcon";

import FileActionPanel from "./FileActionPanel";
import styles from "./styles.module.scss";

const FILE_ICON_MAP = {
	ImageIcon: FileImage,
	VideoIcon: FileVideo,
	ArchiveIcon: FileArchive,
	DocumentIcon: FileText,
};

function getFileIconComponent(fileType) {
	const iconName = getFileIcon(fileType);
	return FILE_ICON_MAP[iconName] || File;
}

function FilePreview({
	removeFile = () => {},
	files = [],
	loading = true,
	errorMap = {},
}) {
	const errorRefs = useRef({});

	useEffect(() => {
		for (const index in errorMap) {
			if (errorRefs.current[index]) {
				errorRefs.current[index].scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				break;
			}
		}
	}, [errorMap]);

	return (
		<>
			<div className={styles.files_count}>
				Files added {files?.length || 0}
			</div>
			{!isEmpty(files) && (
				<div className={styles.file_list}>
					{files?.map((file, index) => (
						<div key={file.name}>
							<div className={styles.file_preview}>
								<div className={styles.file_left}>
									{(() => {
										const IconComp = getFileIconComponent(file.type);
										return (
											<IconComp
												style={{
													width: "2.5rem",
													height: "2.5rem",
													color: "#212121",
												}}
											/>
										);
									})()}

									<div className={styles.file_name}>
										{truncateName(file.name, 30)}
									</div>
									<div className={styles.file_size}>
										{convertBytes({ bytes: file.size })}
									</div>
								</div>

								<FileActionPanel
									loading={loading}
									removeFile={removeFile}
									file={file}
									index={index}
								/>
							</div>

							{errorMap[index] && (
								<div
									ref={(el) =>
										(errorRefs.current[index] = el)
									}
									className={styles.file_error}
								>
									<span
										style={{
											fontSize: "1rem",
											padding: "0px",
											color: "#d32f2f",
										}}
									>
										{errorMap[index]}
									</span>
								</div>
							)}
						</div>
					))}
				</div>
			)}
		</>
	);
}

export default FilePreview;
