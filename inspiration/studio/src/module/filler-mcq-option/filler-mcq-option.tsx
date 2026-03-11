import React from "react";
import { getOptionContainerStyle } from "./styles";
import Image from "./components/image";
import Input from "./components/input";
export type FillerMcqOptionProps = {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  optionType: string;
  option: { id?: any; url?: string; value: string };
  name: string;
  disabled?: boolean;
  iconbgColor?: string;
  icon?: string;
  isChecked: boolean;
  style?: React.CSSProperties;
  inputStyles?: {
    container: any;
    textStyles: any;
    icon: any;
  };
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
};

export function FillerMcqOption({
  optionType,
  option,
  name,
  icon,
  isChecked,
  handleOnChange,
  style = {},
  inputStyles,
  onKeyDown = () => {},
  role = "button",
  tabIndex = 1,
  "aria-label": ariaLabel = "Filler Button",
}: FillerMcqOptionProps) {
  const isImage = option.hasOwnProperty("url");
  return (
    <div
      style={getOptionContainerStyle({ isChecked, style, isImage })}
      data-testid="mcq-option-filler"
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
    >
      <Image option={option} />
      <Input
        optionType={optionType}
        option={option}
        name={name}
        icon={icon}
        isChecked={isChecked}
        handleOnChange={handleOnChange}
        disabled={false}
        inputStyles={inputStyles}
        tabIndex={-1}
      />
    </div>
  );
}
