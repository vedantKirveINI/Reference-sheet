import { Icon } from "@/lib/oute-icon";

function DialogTitle() {
	return (
		<div className="flex gap-3 items-center">
			<Icon
				outeIconName="OUTEAddIcon"
				outeIconProps={{
					className: "h-6 w-6 text-[#263238]",
				}}
			/>
			<div className="text-[#263238] font-inter text-xl font-normal leading-8 tracking-[0.0156rem]">New Table</div>
		</div>
	);
}

export default DialogTitle;
