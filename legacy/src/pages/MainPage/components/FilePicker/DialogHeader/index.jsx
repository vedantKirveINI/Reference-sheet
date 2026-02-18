import ODSIcon from "@/lib/oute-icon";

function DialogHeader({ title = "File Upload" }) {
	return (
		<div className="text-xl text-[#263238] flex items-center font-[var(--tt-font-family)] font-normal">
			<div className="mr-2">
				<ODSIcon
					outeIconName={"UploadFileIcon"}
					outeIconProps={{
						className: "h-6 w-6",
					}}
				/>
			</div>
			{title}
		</div>
	);
}

export default DialogHeader;
