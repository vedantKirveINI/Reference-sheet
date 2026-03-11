import React from "react";
import { ODSCheckbox as Checkbox, ODSRadio as RadioInput } from "@src/module/ods";
import { InputTypes } from "../constant/inputTypes";

export type InputProps = {
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  optionType: string;
  option: { id?: any; url?: string; value: string };
  name: string;
  disabled?: boolean;
  iconbgColor?: string;
  icon: string;
  isChecked: boolean;
  inputStyles?: {
    container: React.CSSProperties;
    textStyles: React.CSSProperties;
    icon: React.CSSProperties;
  };
} & React.HtmlHTMLAttributes<HTMLInputElement>;

function Input({
  optionType,
  option,
  name,
  icon,
  isChecked,
  handleOnChange,
  inputStyles,
}: InputProps) {
  if (optionType === InputTypes.CHECKBOX) {
    return (
      <Checkbox
        label={option?.value}
        name={name}
        icon={icon}
        isChecked={isChecked}
        handleOnChange={handleOnChange}
        disabled={false}
        inputStyles={inputStyles.icon}
      />
    );
  } else {
    return (
      <RadioInput
        label={option?.value}
        name={name}
        icon={icon}
        isChecked={isChecked}
        handleOnChange={handleOnChange}
        disabled={false}
        inputStyles={inputStyles}
      />
    );
  }
}

export default Input;
