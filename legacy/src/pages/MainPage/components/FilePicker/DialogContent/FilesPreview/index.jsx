import { Error } from "@oute/oute-ds.atom.error";
import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import { useRef } from "react";
import { useEffect } from "react";

import truncateName from "../../../../../../utils/truncateName";
import convertBytes from "../../../../../../utils/sizeConversion";
import { getFileIcon } from "../../utils/getFileIcon";

import FileActionPanel from "./FileActionPanel";
import styles from "./styles.module.scss";

function FilePreview({
	removeFile = () => {},
	files = [],
	loading = true,
	errorMap = {},
}) {
	const errorRefs = useRef({});

	useEffect(() => {
		// Find the first error that has an index and scroll it into view
		for (const index in errorMap) {
			if (errorRefs.current[index]) {
				errorRefs.current[index].scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
				break; // Scroll to the first error only
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
						<>
							<div
								key={file.name}
								className={styles.file_preview}
							>
								<div className={styles.file_left}>
									<ODSIcon
										outeIconName={getFileIcon(file.type)}
										outeIconProps={{
											sx: {
												width: "2.5rem",
												height: "2.5rem",
												color: "#212121",
											},
										}}
									/>

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
									} // Assign ref to error element
									className={styles.file_error}
								>
									<Error
										text={`${errorMap[index]}`}
										style={{
											fontSize: "1rem",
											padding: "0px !important",
										}}
									/>
								</div>
							)}
						</>
					))}
				</div>
			)}
		</>
	);
}

export default FilePreview;
