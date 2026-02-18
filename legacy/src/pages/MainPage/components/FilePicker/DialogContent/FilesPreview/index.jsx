import { Error } from "@/lib/error-display";
import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";
import { useRef } from "react";
import { useEffect } from "react";

import truncateName from "../../../../../../utils/truncateName";
import convertBytes from "../../../../../../utils/sizeConversion";
import { getFileIcon } from "../../utils/getFileIcon";

import FileActionPanel from "./FileActionPanel";

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
			<div className="text-xl">
				Files added {files?.length || 0}
			</div>
			{!isEmpty(files) && (
				<div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto">
					{files?.map((file, index) => (
						<>
							<div
								key={file.name}
								className="rounded-lg border border-[color:var(--grey-lighten-4,#cfd8dc)] bg-white flex items-center justify-between p-2 gap-4 shrink-0 overflow-hidden"
							>
								<div className="flex items-center gap-3 grow overflow-hidden">
									<ODSIcon
										outeIconName={getFileIcon(file.type)}
										outeIconProps={{
											size: 40,
											className: "text-[#212121]",
										}}
									/>

									<div className="text-xl whitespace-nowrap overflow-hidden text-ellipsis">
										{truncateName(file.name, 30)}
									</div>
									<div className="text-base text-[color:var(--grey,#607d8b)]">
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
								>
									<Error
										text={`${errorMap[index]}`}
										className="text-base p-0"
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
