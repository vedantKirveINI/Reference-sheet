import React, { memo, useCallback, useMemo, useState } from "react";
import type { SliderProps } from "./types";

export const Slider = memo(({
  question,
  onChange,
  theme,
  isCreator,
  value,
}: SliderProps) => {
  const [showValueLabel, setShowValueLabel] = useState(false);
  const minValue = question?.settings?.minValue ?? 0;
  const maxValue = question?.settings?.maxValue ?? 10;
  const range = maxValue - minValue;
  const currentValue =
    typeof value === "number" && !Number.isNaN(value) && value >= minValue && value <= maxValue
      ? value
      : minValue;

  const pct = range === 0 ? 0 : ((currentValue - minValue) / range) * 100;

  const onChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (isCreator) return;
      const newValue = Number(event.target.value);
      console.log("[Slider] onChange", {
        newValue,
        isCreator,
        hasOnChange: Boolean(onChange),
      });
      onChange?.(newValue);
    },
    [onChange, isCreator]
  );

  const marks = useMemo(() => {
    return Array.from({ length: maxValue - minValue + 1 }, (_, index) => {
      const markValue = index + minValue;
      return { value: markValue, label: `${markValue}` };
    });
  }, [minValue, maxValue]);

  const sliderColor = theme?.styles?.buttons || "#52af77";
  const textColor = theme?.styles?.questions || "#333";
  const thumbColor = theme?.styles?.buttonText || "#fff";

  const containerStyle: React.CSSProperties = {
    width: "100%",
    marginLeft: ".5em",
    display: "flex",
    justifyContent: question?.settings?.questionAlignment === "CENTER" ? "center" : "flex-start",
    alignItems: question?.settings?.questionAlignment === "CENTER" ? "center" : "flex-start",
  };

  const sliderWrapperStyle: React.CSSProperties = {
    width: "60%",
    position: "relative",
  };

  const trackHeight = "0.5em";
  const trackStyle: React.CSSProperties = {
    width: "100%",
    height: trackHeight,
    borderRadius: "0.25em",
    background: "#ddd",
    position: "relative",
  };

  const filledStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    width: `${pct}%`,
    height: trackHeight,
    borderRadius: "0.25em",
    background: sliderColor,
    pointerEvents: "none",
  };

  const thumbSize = "1.5em";
  const thumbStyle: React.CSSProperties = {
    position: "absolute",
    left: `${pct}%`,
    top: "50%",
    transform: "translate(-50%, -50%)",
    width: thumbSize,
    height: thumbSize,
    borderRadius: "50%",
    background: thumbColor,
    border: `2px solid ${sliderColor}`,
    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
    pointerEvents: "none",
  };

  const inputOverlayStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    margin: 0,
    opacity: 0,
    cursor: isCreator ? "not-allowed" : "pointer",
    zIndex: 1,
  };

  const marksContainerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "0.5em",
    fontSize: "1em",
    color: textColor,
  };

  const valueLabelStyle: React.CSSProperties = {
    position: "absolute",
    top: "-2.5em",
    left: `${pct}%`,
    transform: "translateX(-50%)",
    background: sliderColor,
    color: thumbColor,
    padding: "0.25em 0.5em",
    borderRadius: "0.25em",
    fontSize: "0.75em",
    whiteSpace: "nowrap",
    opacity: showValueLabel ? 1 : 0,
    transition: "opacity 0.2s",
    pointerEvents: "none",
    zIndex: 2,
  };

  const tickDotsContainerStyle: React.CSSProperties = {
    position: "absolute",
    left: 0,
    right: 0,
    top: "-0.25em",
    height: trackHeight,
    display: "flex",
    justifyContent: "space-between",
    pointerEvents: "none",
    paddingLeft: "0.25em",
    paddingRight: "0.25em",
  };

  return (
    <div
      style={containerStyle}
      data-testid="slider-container"
    >
      <div style={sliderWrapperStyle}>
        <div
          style={{ position: "relative", opacity: isCreator ? 0.6 : 1 }}
          onMouseEnter={() => setShowValueLabel(true)}
          onMouseLeave={() => setShowValueLabel(false)}
          onFocus={() => setShowValueLabel(true)}
          onBlur={() => setShowValueLabel(false)}
        >
          <div style={{ position: "relative", height: trackHeight }}>
            <div style={trackStyle}>
              <div style={filledStyle} />
              <div style={thumbStyle} />
              <div style={tickDotsContainerStyle}>
                {marks.map((mark) => (
                  <span
                    key={mark.value}
                    style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: "#999",
                      flexShrink: 0,
                    }}
                  />
                ))}
              </div>
            </div>
            <input
              type="range"
              min={minValue}
              max={maxValue}
              value={currentValue}
              onChange={onChangeHandler}
              disabled={isCreator}
              style={inputOverlayStyle}
              data-testid="slider-input"
              aria-valuemin={minValue}
              aria-valuemax={maxValue}
              aria-valuenow={currentValue}
            />
          </div>
          <div style={valueLabelStyle}>{currentValue}</div>
        </div>
        <div style={marksContainerStyle}>
          {marks.map((mark) => (
            <span key={mark.value} style={{ fontSize: "0.875em" }}>
              {mark.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
