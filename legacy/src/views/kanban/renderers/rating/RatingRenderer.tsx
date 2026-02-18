import React, { useMemo } from "react";
import type { ICell, IColumn } from "@/types";
import type { IRatingCell } from "@/types";
import { validateRating } from "@/cell-level/renderers/rating/utils/validateRating";
import ODSIcon from "@/lib/oute-icon";

interface RatingRendererProps {
	cell: ICell;
	column: IColumn;
}

const ICON_MAP: Record<string, string> = {
	star: "OUTEStarIcon",
	crown: "OUTECrownIcon",
	heart: "OUTEHeartIcon",
	thumbs: "OUTEThumbUpIcon",
	thumb: "OUTEThumbUpIcon",
	cup: "OUTECupIcon",
	smile: "OUTESmileIcon",
};

function getIconName(iconOption?: string): string {
	if (!iconOption) return "OUTEStarIcon";

	const lowerKey = iconOption.toLowerCase();
	if (ICON_MAP[lowerKey]) {
		return ICON_MAP[lowerKey];
	}

	if (iconOption.startsWith("OUTE") && iconOption.endsWith("Icon")) {
		return iconOption;
	}

	return "OUTEStarIcon";
}

export const RatingRenderer: React.FC<RatingRendererProps> = ({
	cell,
	column,
}) => {
	const ratingCell = cell as IRatingCell | undefined;

	const fieldOptions = column.options as
		| { maxRating?: number; icon?: string; color?: string }
		| undefined;
	const maxRating =
		fieldOptions?.maxRating ?? ratingCell?.options?.maxRating ?? 10;
	const iconOption = fieldOptions?.icon ?? ratingCell?.options?.icon;
	const iconColor =
		fieldOptions?.color ?? ratingCell?.options?.color ?? "#212121";

	const iconName = useMemo(() => getIconName(iconOption), [iconOption]);

	const { processedValue } = useMemo(() => {
		return validateRating({
			value: (cell.data ?? ratingCell?.data) as
				| number
				| string
				| null
				| undefined,
			maxRating,
		});
	}, [cell.data, ratingCell?.data, maxRating]);

	const currentRating = processedValue ?? 0;

	if (currentRating === 0) {
		return null;
	}

	return (
		<div className="flex items-center gap-[3px]">
			{Array.from({ length: maxRating }, (_, index) => {
				const rating = index + 1;
				const isFilled = currentRating >= rating;

				return (
					<ODSIcon
						key={rating}
						outeIconName={iconName}
						outeIconProps={{
							size: 16,
							className: isFilled ? "" : "opacity-100",
						}}
						style={{
							color: isFilled ? iconColor : "#E0E0E0",
						}}
					/>
				);
			})}
		</div>
	);
};
