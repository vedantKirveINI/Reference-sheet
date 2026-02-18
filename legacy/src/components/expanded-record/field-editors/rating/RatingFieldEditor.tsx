import { useState, useCallback, useMemo, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IRatingCell } from "@/types";
import { validateRating } from "@/cell-level/renderers/rating/utils/validateRating";
import ODSIcon from "oute-ds-icon";
import styles from "./RatingFieldEditor.module.scss";

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

	// If it's already an ODSIcon name (starts with "OUTE"), use it directly
	if (iconOption.startsWith("OUTE")) {
		return iconOption;
	}

	// Default to star
	return "OUTEStarIcon";
}

export const RatingFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const ratingCell = cell as IRatingCell | undefined;

	// Get options with defaults - handle both object and array types for field.options
	const fieldOptions = field.options as
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
			value: (value ?? ratingCell?.data) as
				| number
				| string
				| null
				| undefined,
			maxRating,
		});
	}, [value, ratingCell?.data, maxRating]);

	const currentRating = processedValue ?? 0;

	// Hover state
	const [hoverRating, setHoverRating] = useState<number>(0);

	// Handle icon click
	const handleIconClick = useCallback(
		(rating: number) => {
			if (readonly) return;
			// Toggle: if clicking the same rating, set to null; otherwise set to rating
			const newRating = rating === currentRating ? null : rating;
			onChange(newRating);
		},
		[currentRating, onChange, readonly],
	);

	// Handle icon hover
	const handleIconHover = useCallback(
		(rating: number) => {
			if (readonly) return;
			setHoverRating(rating);
		},
		[readonly],
	);

	// Handle mouse leave
	const handleMouseLeave = useCallback(() => {
		setHoverRating(0);
	}, []);

	return (
		<div
			className={styles.rating_container}
			onMouseLeave={handleMouseLeave}
			data-testid="rating-expanded-row"
		>
			{Array.from({ length: maxRating }, (_, index) => {
				const rating = index + 1;
				const isFilled = currentRating >= rating;
				const isHovered =
					hoverRating >= rating && hoverRating > currentRating;

				// Determine className and icon color/opacity based on state
				let iconClassName = styles.rating_icon;
				let iconSx: React.CSSProperties = {
					width: "1.5rem",
					height: "1.5rem",
				};

				if (isFilled) {
					iconSx.color = iconColor;
					iconSx.opacity = 1;
				} else if (isHovered) {
					iconSx.color = iconColor;
					iconSx.opacity = 0.3;
				} else {
					iconSx.color = "#E0E0E0";
					iconSx.opacity = 1;
				}

				return (
					<button
						key={rating}
						className={iconClassName}
						onClick={() => handleIconClick(rating)}
						onMouseEnter={() => handleIconHover(rating)}
						disabled={readonly}
						aria-label={`Rate ${rating} out of ${maxRating}`}
						data-testid={`rating-icon-${rating}`}
					>
						<ODSIcon
							outeIconName={iconName}
							outeIconProps={{
								sx: iconSx,
							}}
						/>
					</button>
				);
			})}
		</div>
	);
};
