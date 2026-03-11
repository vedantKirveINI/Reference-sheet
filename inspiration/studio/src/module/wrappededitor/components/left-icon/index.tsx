import React from "react";
import { getIconStyle, getMCQSelectedStyles } from "../../styles";
import SingleChoice from "../../assets/icons/singleChoice";
import CorrectIcon from "../../assets/CorrectIcon";
interface OptionIconProps {
  isSelected: boolean;
  disabled: boolean;
  inputType: "Radio" | "Checkbox";
  isHover: boolean;
  hoverIcon?: React.ReactNode | string;
  onLeftIconClick?: () => void;
  leftIcon?: React.ReactNode | string;
  style?: React.CSSProperties;
  theme?: any;
}

const LeftIcon = ({
  isSelected,
  hoverIcon,
  inputType,
  onLeftIconClick,
  isHover,
  leftIcon,
  disabled,
  theme = {},
  style = {},
}: OptionIconProps) => {
  const Icon = (
    icon: React.ReactNode | string,
    backgroundColor: string,
    testId: string,
    clickable = false
  ) => (
    <span
      style={getIconStyle({
        backgroundColor,
        theme,
        styles: {
          fontSize: "1em",
          ...style,
        },
        inputType,
      })}
      onClick={clickable ? onLeftIconClick : undefined}
      data-testid={testId}
    >
      {icon}
    </span>
  );

  const getSelectedIcon = () => (
    <div style={getMCQSelectedStyles(inputType, theme)}>
      {inputType === "Checkbox" ? (
        <CorrectIcon
          style={{ width: "1.5em", height: "1.5em" }}
          fill={theme?.styles?.buttonText}
          data-testid="wrapped-editor-selected-icon-checkbox"
        />
      ) : (
        <SingleChoice
          style={{ width: "1.0625em", height: "1.0625em" }}
          fill={theme?.styles?.buttons}
          data-testid="wrapped-editor-selected-icon-radio"
        />
      )}
    </div>
  );

  const getRegularIcon = () => {
    if (disabled) {
      return Icon(leftIcon, "#fff", "wrapped-editor-left-icon");
    }

    if (hoverIcon && isHover) {
      return Icon(hoverIcon, "black", "wrapped-editor-hover-icon", true);
    }

    return Icon(
      leftIcon,
      "#fff",
      hoverIcon ? "wrapped-editor-hover-left-icon" : "wrapped-editor-left-icon"
    );
  };

  return (
    <div data-testid="wrapped-editor-left-icon">
      {isSelected ? getSelectedIcon() : getRegularIcon()}
    </div>
  );
};

export default LeftIcon;
