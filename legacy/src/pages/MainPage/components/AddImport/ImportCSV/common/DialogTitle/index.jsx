import ODSIcon from "@/lib/oute-icon";

import { TITLE_ICON, TITLE_TYPING } from "../../constant";

function DialogTitle({ currentStep = 1, formData = {} }) {
	const title = TITLE_TYPING[currentStep] || formData?.fileName;

	const titleIcon = TITLE_ICON[currentStep];

	return (
		<div className="flex items-center">
			{titleIcon && (
				<ODSIcon
					outeIconName={titleIcon?.outeIconName}
					outeIconProps={{
						...titleIcon?.outeIconProps,
						sx: {
							...titleIcon?.outeIconProps?.sx,
							color: titleIcon?.outeIconProps?.sx?.color || "#263238",
						},
						className: "h-6 w-6",
					}}
				/>
			)}

			<div className="max-w-[24rem] ml-3 whitespace-nowrap text-ellipsis overflow-hidden font-inter text-xl font-normal">{title || "Import File"}</div>
		</div>
	);
}

export default DialogTitle;
