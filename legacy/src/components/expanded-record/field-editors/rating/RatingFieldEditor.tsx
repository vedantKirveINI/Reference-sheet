import { useState, useCallback, useMemo, FC } from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IRatingCell } from "@/types";
import { validateRating } from "@/cell-level/renderers/rating/utils/validateRating";
import ODSIcon from "@/lib/oute-icon";

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

	if (iconOption.startsWith("OUTE")) {
		return iconOption;
	}

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

	const fieldOptions = field.options as
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
			value: (value ?? ratingCell?.data) as
				| number
				| string
				| null
				| undefined,
			maxRating,
		});
	}, [value, ratingCell?.data, maxRating]);

	const currentRating = processedValue ?? 0;

	const [hoverRating, setHoverRating] = useState<number>(0);

	const handleIconClick = useCallback(
		(rating: number) => {
			if (readonly) return;
			const newRating = rating === currentRating ? null : rating;
			onChange(newRating);
		},
		[currentRating, onChange, readonly],
	);

	const handleIconHover = useCallback(
		(rating: number) => {
			if (readonly) return;
			setHoverRating(rating);
		},
		[readonly],
	);

	const handleMouseLeave = useCallback(() => {
		setHoverRating(0);
	}, []);

	return (
		<div
			className="flex items-center gap-[0.1875rem] flex-wrap min-h-[2.5rem] py-1"
			onMouseLeave={handleMouseLeave}
			data-testid="rating-expanded-row"
		>
			{Array.from({ length: maxRating }, (_, index) => {
				const rating = index + 1;
				const isFilled = currentRating >= rating;
				const isHovered =
					hoverRating >= rating && hoverRating > currentRating;

				let color = "#E0E0E0";
				let opacity = 1;

				if (isFilled) {
					color = iconColor;
					opacity = 1;
				} else if (isHovered) {
					color = iconColor;
					opacity = 0.3;
				}

				return (
					<button
						key={rating}
						className="bg-transparent border-none p-0 m-0 cursor-pointer leading-none transition-[opacity,transform,filter] duration-150 select-none flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
						onClick={() => handleIconClick(rating)}
						onMouseEnter={() => handleIconHover(rating)}
						disabled={readonly}
						aria-label={`Rate ${rating} out of ${maxRating}`}
						data-testid={`rating-icon-${rating}`}
					>
						<ODSIcon
							outeIconName={iconName}
							outeIconProps={{
								size: 24,
								className: `w-6 h-6`,
								style: { color, opacity },
							}}
						/>
					</button>
				);
			})}
		</div>
	);
};
