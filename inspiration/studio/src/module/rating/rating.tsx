import { useEffect, useState } from "react";
import { styles } from "./style";
import { ViewPort, RATING_EMOJIS } from "@oute/oute-ds.core.constants";
import { ODSIcon } from "@src/module/ods";

export type RatingProps = {
  onChange?: (value: number) => void;
  disabled?: boolean;
  theme?: any;
  question?: any;
  isCreator?: boolean;
  viewPort?: ViewPort;
  value?: number;
  isAnswered?: boolean;
};

export function Rating(props: RatingProps) {
  const {
    onChange,
    theme = {},
    question,
    isCreator,
    viewPort,
    isAnswered,
    value,
  } = props;
  const rating = question?.settings?.defaultRating;
  const maxRating = question?.settings?.maxRating;
  const defaultAlignment = question?.settings?.questionAlignment;
  const icon = question?.settings?.ratingEmoji;

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    if (isCreator) return;
    setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (isCreator) return;
    setHoverRating(null);
  };

  const handleClick = (index: number) => {
    if (isCreator) return;
    onChange?.(index + 1);
  };

  useEffect(() => {
    if (!isAnswered && question?.settings?.defaultRating) {
      onChange?.(rating);
    }
  }, []);

  return (
    <div
      style={styles.container({ defaultAlignment, isCreator, viewPort })}
      data-testid="rating"
    >
      {Array.from({ length: maxRating }).map((_, index) => {
        const isFilled = hoverRating
          ? index < hoverRating
          : !isAnswered
            ? index < rating
            : index < value;

        return (
          <div
            key={index}
            style={{
              ...styles.starWrap,
              cursor: isCreator ? "not-allowed" : "pointer",
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            data-testid={`${RATING_EMOJIS[icon].label}-${index}`}
          >
            <ODSIcon
              outeIconName={RATING_EMOJIS[icon].emoji}
              outeIconProps={{
                "data-testid": `${RATING_EMOJIS[icon].label}`,
                style: {
                  ...styles.IconSize,
                  color: theme?.styles?.buttons,
                  opacity: isFilled ? 1 : 0.5,
                },
              }}
            />
            <span style={styles.color(theme)}>{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
}
