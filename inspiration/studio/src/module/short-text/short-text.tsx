import { TextField } from "@src/module/text-field";
import { useEffect, useMemo } from "react";
import { QuestionType } from "@src/module/constants";
import isEmpty from "lodash-es/isEmpty";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { getTextTransformedValue } from "./utils/get-text-transformed-value";

export type ShortTextProps = {
  /**
   * a node to be rendered in the special component.
   */
  placeholder?: string;
  value?: string;
  onChange?: (value) => void;
  isCreator?: boolean;
  setValue?: any;
  theme?: any;
  maxLength?: number;
  question?: any;
  error?: string | undefined;
  autoFocus?: boolean;
  disabled?: boolean;
  answers?: any;
  state?: any;
  isAnswered?: boolean;
  onFocus?: any;
};

export function ShortText({
  placeholder,
  value,
  onChange,
  isCreator,
  theme,
  maxLength,
  question,
  error,
  autoFocus = false,
  disabled = false,
  answers = {},
  state = {},
  isAnswered = false,
  onFocus = () => {},
}: ShortTextProps) {
  const textTransformCase = question?.settings?.textTransformation?.case;
  const defaultValue = question?.settings?.defaultValue;

  const handleOnChange = (_event: unknown, value: string) => {
    if (isCreator) {
      onChange(value?.slice(0, 150));
      return;
    }
    // Apply text case transformation when user types (same as Long Text)
    if (textTransformCase) {
      const caseType = typeof textTransformCase === "string" ? textTransformCase.toLowerCase() : "none";
      const str = (value ?? "").toString();
      const transformed = getTextTransformedValue(str, caseType);
      onChange(transformed !== undefined ? transformed : str);
      return;
    }
    onChange(value);
  };

  const resolveFX = () => {
    try {
      const res = OuteServicesFlowUtility?.resolveValue(
        { ...answers, ...state },
        "",
        defaultValue,
        "string"
      );
      let resolvedValue = res?.value;

      const maxChar = question?.settings?.maxChar || 255;

      if (maxChar) {
        resolvedValue = resolvedValue?.slice(0, maxChar);
      }

      const caseType = (typeof textTransformCase === "string" ? textTransformCase : "").toLowerCase() || "none";
      return getTextTransformedValue(resolvedValue, caseType);
    } catch (error) {
    }
  };

  useEffect(() => {
    if (!isEmpty(defaultValue) && !isCreator && !isAnswered) {
      const resolvedValue = resolveFX();
      if (resolvedValue) {
        onChange(resolvedValue);
      }
    }
  }, []);

  // Real-time validation for minChar/maxChar — same as Long Text; red border when invalid or error
  const isValueValid = useMemo(() => {
    if (isCreator || value == null || value === "") {
      return true;
    }
    const valueStr = String(value);
    const minChar = question?.settings?.minChar;
    const maxChar = question?.settings?.maxChar ?? maxLength ?? 255;
    if (minChar != null && minChar > 0 && valueStr.length < minChar) {
      return false;
    }
    if (maxChar != null && valueStr.length > maxChar) {
      return false;
    }
    return true;
  }, [value, question?.settings?.minChar, question?.settings?.maxChar, maxLength, isCreator]);

  const hasError = !!error || (!isCreator && !isValueValid);

  return (
    <TextField
      isDisabled={disabled}
      textType={QuestionType.SHORT_TEXT}
      maxLength={maxLength || 255}
      value={value ?? ""}
      placeholder={placeholder || "Type your answer here..."}
      onChange={(e, value) => {
        handleOnChange(e, value);
      }}
      theme={theme}
      isCreator={isCreator}
      textTransformCase={undefined}
      testId="short-text"
      isRequired={question?.settings?.required}
      error={hasError ? (typeof error === "string" ? error : true) : undefined}
      type={question?.settings?.maskResponse ? "password" : "text"}
      autoFocus={autoFocus}
      onFocus={onFocus}
    />
  );
}
