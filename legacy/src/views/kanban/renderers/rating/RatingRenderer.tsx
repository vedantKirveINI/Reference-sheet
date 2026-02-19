import React, { useMemo } from "react";
import type { ICell, IColumn } from "@/types";
import type { IRatingCell } from "@/types";
import { validateRating } from "@/cell-level/renderers/rating/utils/validateRating";
import { Star, Heart, ThumbsUp, Crown, Trophy, Smile } from "lucide-react";
import styles from "./RatingRenderer.module.scss";

interface RatingRendererProps {
	cell: ICell;
	column: IColumn;
}

const ICON_COMPONENT_MAP: Record<string, React.FC<any>> = {
	star: Star,
	crown: Crown,
	heart: Heart,
	thumbs: ThumbsUp,
	thumb: ThumbsUp,
	cup: Trophy,
	smile: Smile,
};

function getIconComponent(iconOption?: string): React.FC<any> {
	if (!iconOption) return Star;

	const lowerKey = iconOption.toLowerCase();
	if (ICON_COMPONENT_MAP[lowerKey]) {
		return ICON_COMPONENT_MAP[lowerKey];
	}

	return Star;
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

	// Get icon component
	const IconComponent = useMemo(() => getIconComponent(iconOption), [iconOption]);

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

				return (
					<IconComponent
						key={rating}
						style={{
							width: "1rem",
							height: "1rem",
							color: isFilled ? iconColor : "#E0E0E0",
							opacity: 1,
							fill: isFilled ? iconColor : "none",
						}}
					/>
				);
			})}
		</div>
	);
};
