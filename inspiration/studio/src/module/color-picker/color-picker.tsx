import React, { useRef } from "react";
import { getColorPickerContainerStyles, getInputStyles, getColorCodeTextStyles, getInputWrapperStyles,  } from "./styles";
import rgbaToHex from "./utils/rgbaToHex";
export type IColorPickerProps = {
  value: string;
  onChange: any;
  dataTestId?: string;
  style?: any;
};
export const ColorPicker = ({
  value,
  onChange,
  dataTestId = "color-picker-component",
  style = {},
}: IColorPickerProps) => {
  const colorPickerRef = useRef(null);
  const handleDivClick = () => {
    colorPickerRef.current.click();
  };
  const colorValue = !!value ? value : "#000000";
  const handleOnChange = (e) => {
    const valueInHex = rgbaToHex(e.target.value);
    onChange(e, valueInHex);
  };
  return (
    <div
      style={getColorPickerContainerStyles(style)}
      data-testid={dataTestId}
      onClick={handleDivClick}
    >
      <div style={{ ...getInputWrapperStyles(), background: colorValue }}>
        <input
          ref={colorPickerRef}
          type="color"
          value={colorValue}
          onChange={(e) => {
            handleOnChange(e);
          }}
          style={getInputStyles}
          data-testid="color-picker-input"
        />
      </div>
      <p style={getColorCodeTextStyles()}>{colorValue}</p>
    </div>
  );
};
