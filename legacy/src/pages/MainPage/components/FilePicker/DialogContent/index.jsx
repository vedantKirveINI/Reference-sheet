import isEmpty from "lodash/isEmpty";
import ODSIcon from "@/lib/oute-icon";

import FileCounterDisplay from "./FileCounterDisplay";
import FilePreview from "./FilesPreview";

function DialogContent({
	getRootProps = () => {},
	getInputProps,
	files = [],
	removeFile = () => {},
	loading = false,
	error = null,
	errorMap = {},
	noOfFilesAllowed = 100,
}) {
	const hasReachedFileLimit = files.length >= noOfFilesAllowed;

	return (
		<div className="p-6 flex flex-col gap-4">
			{hasReachedFileLimit ? (
				<FileCounterDisplay fileCount={files.length} />
			) : (
				<div {...getRootProps()} className="flex h-[200px] py-6 px-0 flex-col justify-center items-center self-stretch rounded-md bg-[#f6f6f6] cursor-pointer">
					<input {...getInputProps()} />
					<ODSIcon
						outeIconName={"UploadFileIcon"}
						outeIconProps={{
							className: "h-[50px] w-10 text-[#212121]",
						}}
					/>
					<div className="text-[#343f45] text-base mt-[25px]">
						Drag & drop or{" "}
						<span className="text-[#212121] font-bold underline cursor-pointer">Choose file</span> to
						upload.
					</div>
				</div>
			)}

			{!isEmpty(files) && (
				<FilePreview
					removeFile={removeFile}
					files={files}
					loading={loading}
					error={error}
					errorMap={errorMap}
				/>
			)}
		</div>
	);
}

export default DialogContent;
