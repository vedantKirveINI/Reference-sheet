import ODSIcon from "@/lib/oute-icon";

function DialogTitle() {
	return (
		<div className="flex gap-4 items-center px-2">
			<ODSIcon
				outeIconName="OUTEShareIcon"
				outeIconProps={{
					size: 24,
					className: "text-[#212121]",
				}}
			/>
			<div className="text-[#263238] font-inter text-xl font-normal leading-8 tracking-[0.0156rem]">Share</div>
		</div>
	);
}

export default DialogTitle;
