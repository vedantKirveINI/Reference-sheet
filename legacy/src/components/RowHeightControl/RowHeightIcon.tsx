import React from "react";
import ODSIcon from "@/lib/oute-icon";
import { RowHeightLevel } from "@/types";
import {
	SHORT_HEIGHT_ICON,
	MEDIUM_HEIGHT_ICON,
	TALL_HEIGHT_ICON,
	EXTRA_TALL_HEIGHT_ICON,
} from "@/constants/Icons/commonIcons";

interface RowHeightIconProps {
	level: RowHeightLevel;
	isSelected: boolean;
	size?: number;
	className?: string;
}

const ROW_HEIGHT_ICON_MAP: Record<RowHeightLevel, string> = {
	[RowHeightLevel.Short]: SHORT_HEIGHT_ICON,
	[RowHeightLevel.Medium]: MEDIUM_HEIGHT_ICON,
	[RowHeightLevel.Tall]: TALL_HEIGHT_ICON,
	[RowHeightLevel.ExtraTall]: EXTRA_TALL_HEIGHT_ICON,
};


export const RowHeightIcon: React.FC<RowHeightIconProps> = ({
	level,
	isSelected,
	className,
}) => {
	const iconUrl = ROW_HEIGHT_ICON_MAP[level] || ROW_HEIGHT_ICON_MAP[RowHeightLevel.Short];
	const combinedClassName = `w-4 h-4 ${isSelected ? "opacity-100" : "opacity-50"} ${className || ""}`.trim();

	return (
		<ODSIcon
			imageProps={{
				src: iconUrl,
				alt: `Row height: ${level}`,
				className: combinedClassName,
			}}
		/>
	);
};
