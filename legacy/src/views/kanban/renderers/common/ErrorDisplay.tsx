import React from "react";
import ODSIcon from "@/lib/oute-icon";
import { ERROR_ICON } from "@/constants/Icons/commonIcons";

interface ErrorDisplayProps {
	message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
	return (
		<div className="flex items-center gap-1.5 bg-[#ffebee] px-2 py-1 rounded max-w-full overflow-hidden">
			<span className="text-base text-[#263238] font-normal overflow-hidden text-ellipsis whitespace-nowrap flex-1">{message}</span>
			<ODSIcon
				imageProps={{
					src: ERROR_ICON,
					alt: "Error",
					className: "w-5 h-5",
				}}
			/>
		</div>
	);
};
