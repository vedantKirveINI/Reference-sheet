import { Icon } from "@/lib/oute-icon";

import { SIGNATURE_ICON } from "../../../../../constants/Icons/questionTypeIcons";

function Header({ title = "" }) {
	return (
		<div className="flex items-center gap-4">
			<Icon
				imageProps={{
					src: SIGNATURE_ICON,
					className: "w-6 h-6",
				}}
			/>
			<span className="font-sans font-normal">
				{title}
			</span>
		</div>
	);
}

export default Header;
