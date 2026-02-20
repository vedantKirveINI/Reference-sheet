import React, { useMemo } from "react";
import type { ICell, IColumn } from "@/types";
import type { IRatingCell } from "@/types";
import { validateRating } from "@/cell-level/renderers/rating/utils/validateRating";
import ODSIcon from "oute-ds-icon";
import styles from "./RatingRenderer.module.scss";

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
	if (!iconOption) return "OUTEStarIcon"; // Default star

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

	// Get options with defaults
	const fieldOptions = column.options as
		| { maxRating?: number; icon?: string; color?: string }
		| undefined;
	const maxRating =
		fieldOptions?.maxRating ?? ratingCell?.options?.maxRating ?? 10;
	const iconOption = fieldOptions?.icon ?? ratingCell?.options?.icon;
	const iconColor =
		fieldOptions?.color ?? ratingCell?.options?.color ?? "#212121";

	// Get icon name
	const iconName = useMemo(() => getIconName(iconOption), [iconOption]);

	// Parse and validate current value
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

	// Don't render if rating is 0
	if (currentRating === 0) {
		return null;
	}

	return (
		<div className={styles.ratingContainer}>
			{Array.from({ length: maxRating }, (_, index) => {
				const rating = index + 1;
				const isFilled = currentRating >= rating;

				// Determine icon color and opacity
				const iconSx: React.CSSProperties = {
					width: "1rem",
					height: "1rem",
					color: isFilled ? iconColor : "#E0E0E0",
					opacity: 1,
				};

				return (
					<ODSIcon
						key={rating}
						outeIconName={iconName}
						outeIconProps={{
							sx: iconSx,
						}}
					/>
				);
			})}
		</div>
	);
};
