import { Button } from "@/components/ui/button";
import { Icon } from "@/lib/oute-icon";
import ODSIcon from "@/lib/oute-icon";

import { SIGNATURE_ICON } from "../../../../../constants/Icons/questionTypeIcons";

const ExpandedView = ({
	initialValue = "",
	variant = "black",
	label = "EDIT",
	setIsExpanded = () => {},
	openDialog = () => {},
}) => {
	return (
		<div className="flex flex-col gap-6 p-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-[0.375rem]">
					<Icon
						imageProps={{
							src: SIGNATURE_ICON,
							className: "w-5 h-5",
						}}
					/>
					<span className="text-sm font-normal font-sans">
						Signature
					</span>
				</div>

				<ODSIcon
					outeIconName="OUTECloseIcon"
					onClick={() => setIsExpanded(() => "")}
					outeIconProps={{
						className: "cursor-pointer",
					}}
					buttonProps={{
						className: "p-0",
					}}
				/>
			</div>

			<Icon
				imageProps={{
					src: initialValue,
					className: "w-[13.75rem] h-[9.375rem] object-contain",
				}}
			/>

			<Button
				variant={variant === "black" ? "default" : "outline"}
				onClick={openDialog}
			>
				<ODSIcon
					outeIconName="OUTEEditIcon"
					outeIconProps={{
						className: "text-white",
					}}
				/>
				{label}
			</Button>
		</div>
	);
};

export default ExpandedView;
