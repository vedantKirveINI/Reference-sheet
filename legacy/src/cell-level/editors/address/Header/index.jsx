import { Icon } from "@/lib/oute-icon";
import React from "react";

import { CONTACT_PHONE_ICON } from "@/constants/Icons/questionTypeIcons";

const Header = () => {
	return (
		<div className="flex items-center font-[var(--tt-font-family)] text-base font-normal text-[var(--cell-text-primary-color)]">
			<Icon
				imageProps={{
					src: CONTACT_PHONE_ICON,
					className: "w-5 h-5",
				}}
			/>
			<div className="pl-[0.375rem]">Contact</div>
		</div>
	);
};

export default Header;
