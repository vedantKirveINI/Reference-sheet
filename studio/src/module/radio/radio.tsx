import React from "react";
import { getRadioContainerStyle, getInputContainerStyles, getRadioInputStyles, getRadioCircleStyles,  } from "./styles";
import RadioIcon from "./assets/icons/radioIcon";
import { Editor } from "@src/module/editor";

export type RadioInputProps = {
  isChecked: boolean;
  handleOnChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
  disabled?: boolean;
  iconbgColor?: string;
  icon: string;
  style?: any;
  inputStyles?: {
    container: React.CSSProperties;
    textStyles: React.CSSProperties;
    icon: React.CSSProperties;
  };
};

export function RadioInput({
  label,
  name,
  icon,
  handleOnChange,
  isChecked,
  style = {},
  inputStyles,
}: RadioInputProps) {
  return (
    <label
      htmlFor={`radio-${label}`}
      style={getRadioContainerStyle({
        style: { ...style, ...inputStyles?.container },
      })}
    >
      <div data-testid="fds-atom-radioinput" style={getInputContainerStyles()}>
        <input
          style={getRadioInputStyles()}
          name={name}
          type="radio"
          checked={isChecked}
          value={label}
          onChange={handleOnChange}
          data-testid="radio-input"
          id={`radio-${label}`}
          tabIndex={-1}
        />
        <div
          style={{ ...(getRadioCircleStyles({
            isChecked,
            iconbgColor: isChecked ? "#4694e2" : "",
          })), ...inputStyles.icon }}
        >
          {isChecked ? (
            <RadioIcon
              style={{ fontSize: "1em", overflow: "visible" }}
              width="1.2em"
              height="1.2em"
            />
          ) : (
            <div data-testid="radio-option-unchecked">{icon}</div>
          )}
        </div>
      </div>

      {!!label ? (
        <div>
          <Editor
            editable={false}
            value={label}
            style={{ ...inputStyles?.textStyles }}
          />
        </div>
      ) : (
        <></>
      )}
    </label>
  );
}
