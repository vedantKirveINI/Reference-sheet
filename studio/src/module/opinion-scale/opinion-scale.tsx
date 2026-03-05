import React, { useCallback, useEffect } from "react";
import { OpionionScaleProps } from "./types";
import { opinionScaleStyles } from "./styles";
export const OpinionScale = ({
  question,
  onChange,
  isCreator,
  viewPort,
  isAnswered,
  value,
  theme,
}: OpionionScaleProps) => {
  const defaultValue = question?.settings?.defaultValue;
  const maxValue = question?.settings?.maxValue;
  const defaultAlignment = question?.settings?.questionAlignment;

  const handleClick = useCallback((index: number) => {
    if (isCreator) return;
    onChange?.(index + 1);
  }, []);

  useEffect(() => {
    if (!isAnswered && defaultValue) {
      onChange?.(defaultValue);
    }
  }, []);

  return (
    <div
      style={opinionScaleStyles.container({
        defaultAlignment,
        isCreator,
        viewPort,
      })}
      data-testid="opinion-scale"
    >
      {Array.from({ length: maxValue }).map((_, index) => {
        const isSelected = index + 1 === value;
        return (
          <div
            key={index}
            style={{
              ...opinionScaleStyles.starWrap({ theme, isSelected }),
              cursor: isCreator ? "not-allowed" : "pointer",
            }}
            onClick={() => handleClick(index)}
            data-testid={`opinion-scale-${index}`}
          >
            <span style={opinionScaleStyles.color(theme, isSelected)}>
              {index + 1}
            </span>
          </div>
        );
      })}
    </div>
  );
};
