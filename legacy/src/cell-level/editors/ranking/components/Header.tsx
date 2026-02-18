/**
 * Header Component for Ranking Dialog
 * Inspired by sheets project's Header
 */
import React from "react";
import { Icon } from "@/lib/oute-icon";
import { RANKING_ICON } from "@/constants/Icons/questionTypeIcons";

interface HeaderProps {
	title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = "" }) => {
	return (
		<div
			className="flex items-center gap-4"
			data-testid="dialog-ranking-header"
		>
			<Icon
				imageProps={{
					src: RANKING_ICON,
					className: "w-6 h-6",
				}}
			/>
			<span className="font-sans font-normal">
				{title}
			</span>
		</div>
	);
};
