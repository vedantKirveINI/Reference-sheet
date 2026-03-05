import React, { ReactNode } from "react";
import { TextAreaProps } from "./types";

//export { TextAreaProps };
export function TextArea(props: TextAreaProps) {
  const {
    value,
    isDisabled,
    isRequired,
    onChange,
    onFocus,
    onBlur,
    minimumRows,
    name,
    placeholder,
    testId,
  } = props;
  return (
    <textarea
      test-id={testId}
      value={value}
      disabled={isDisabled}
      required={isRequired}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      rows={minimumRows}
      name={name}
      placeholder={placeholder}
    />
  );
}
