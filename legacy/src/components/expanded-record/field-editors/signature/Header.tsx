import React from "react";
import ODSIcon from "@/lib/oute-icon";
import { SIGNATURE_ICON } from "@/constants/Icons/questionTypeIcons";

interface HeaderProps {
	title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "" }) => {
	return (
		<div className="flex items-center gap-4 px-2">
			<ODSIcon
				imageProps={{
					src: SIGNATURE_ICON,
					className: "w-6 h-6",
				}}
			/>
			<span className="font-[Inter] font-normal">
				{title}
			</span>
		</div>
	);
};

export default Header;
