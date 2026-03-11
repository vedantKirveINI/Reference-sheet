import { forwardRef } from "react";
import { useEffect, useMemo } from "react";
import { TextField } from "@src/module/text-field";
import { QuestionType } from "@src/module/constants";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";

import {
  INTERMEDIATE_NUMBER_REGEX,
  VALID_NUMBER_REGEX,
} from "./constants/constant";

export type NumberProps = {
  value: number;
  placeholder?: string;
  onChange: (value: number) => void;
  isCreator?: boolean;
  isInputValid?: boolean;
  autoFocus?: boolean;
  theme?: any;
  settings?: any;
  disabled?: boolean;
  isRequired?: boolean;
  testId?: string;
  answers?: any;
  isAnswered?: boolean;
  style?: any;
  onFocus?: any;
  // onError?: (error: string) => void;
};

export const Number = forwardRef(
  (
    {
      value,
      placeholder,
      isCreator,
      settings,
      onChange,
      theme,
      autoFocus,
      isInputValid,
      disabled = false,
      isRequired = false,
      testId = "number-input",
      answers = {},
      isAnswered = false,
      style = {},
      onFocus = () => {},
      // onError = () => {},
    }: NumberProps,
    ref: any
  ) => {
    const resolveFX = () => {
      try {
        const res = OuteServicesFlowUtility?.resolveValue(
          answers,
          "",
          settings?.defaultValue,
          null
        );
        const resolvedValue = res?.value;
        return resolvedValue;
      } catch (error) {
      }
    };

    useEffect(() => {
      const defaultValue = settings?.defaultValue;
      if (defaultValue !== null && defaultValue !== undefined && defaultValue !== "" && !isCreator && !isAnswered) {
        let resolvedValue = null;
        if (typeof settings?.defaultValue === "object") {
          resolvedValue = resolveFX();
        } else {
          resolvedValue = settings?.defaultValue; // this is temporary change so that previous integretion will not break
        }

        if (!isNaN(window.Number(resolvedValue))) {
          const slicedValue = String(resolvedValue).slice(0, 15);
          const formattedValue = window.Number(slicedValue);
          if (!formattedValue && formattedValue !== 0) return;
          onChange(formattedValue);
        }
      }
    }, []);

    // Validate all number constraints internally for real-time feedback
    const isValueValid = useMemo(() => {
      if (isCreator || value == null) {
        return true;
      }

      const valueStr = String(value);
      
      // Skip validation for empty or intermediate values (like "5." or "-")
      if (valueStr === "" || valueStr === "-" || valueStr === "+") {
        return true;
      }

      const isIntermediateValue = INTERMEDIATE_NUMBER_REGEX.test(valueStr);
      if (isIntermediateValue) {
        return true;
      }

      const numericValue = window.Number(valueStr);
      
      // Check if it's a valid number (not NaN)
      if (window.isNaN(numericValue)) {
        return true; // Let format validation handle invalid numbers
      }

      const allowNegative = settings?.allowNegative;
      const allowFraction = settings?.allowFraction;
      const decimalPlaces = settings?.decimalPlaces;

      // Validate negative numbers
      if (!allowNegative && numericValue < 0) {
        return false;
      }

      // Check if decimalPlaces is configured - if so, it controls decimal validation independently
      const hasDecimalPlacesConfig = decimalPlaces !== undefined && decimalPlaces !== "" && decimalPlaces != null;
      
      if (hasDecimalPlacesConfig) {
        // If decimalPlaces is set, allow both integers and decimals (up to the limit)
        // Validate decimal places when decimal input is present
        if (valueStr.includes(".")) {
          const parts = valueStr.split(".");
          const decimals = parts[1];
          if (decimals) {
            const maxDecimals = window.Number(String(decimalPlaces));
            const decimalsLength = decimals.length;
            if (!window.isNaN(maxDecimals) && decimalsLength > maxDecimals) {
              return false;
            }
          }
        }
        // Integers are always valid when decimalPlaces is configured
      } else {
        // If decimalPlaces is not set, use allowFraction setting
        if (!allowFraction) {
          // If allowFraction is disabled and decimalPlaces is not set, only integers are allowed
          if (!/^[-+]?\d+$/.test(valueStr)) {
            return false;
          }
        } else {
          // When allowFraction is enabled and decimalPlaces is not set, default to 2 decimal places
          if (valueStr.includes(".")) {
            const parts = valueStr.split(".");
            const decimals = parts[1];
            if (decimals) {
              const maxDecimals = 2; // Default to 2 when allowFraction is enabled
              const decimalsLength = decimals.length;
              if (decimalsLength > maxDecimals) {
                return false;
              }
            }
          }
        }
      }

      // Check both settings.min/max and settings.minValue/maxValue for compatibility
      const minValue = settings?.min !== undefined && settings?.min !== "" 
        ? window.Number(settings.min) 
        : settings?.minValue !== undefined && settings?.minValue !== "" 
        ? window.Number(settings.minValue) 
        : null;
      
      const maxValue = settings?.max !== undefined && settings?.max !== "" 
        ? window.Number(settings.max) 
        : settings?.maxValue !== undefined && settings?.maxValue !== "" 
        ? window.Number(settings.maxValue) 
        : null;

      // Validate min constraint
      if (minValue !== null && !window.isNaN(minValue) && numericValue < minValue) {
        return false;
      }
      
      // Validate max constraint
      if (maxValue !== null && !window.isNaN(maxValue) && numericValue > maxValue) {
        return false;
      }

      return true;
    }, [value, settings?.min, settings?.max, settings?.minValue, settings?.maxValue, settings?.allowNegative, settings?.allowFraction, settings?.decimalPlaces, isCreator]);

    const handleNumberChange = (e: any, value?: string) => {
      // TextField component may pass (e, value) or just e
      const _value = value !== undefined ? value : e?.target?.value || "";
      
      if (isCreator) {
        onChange(_value);
        return;
      }

      if (_value === "") {
        onChange(_value);
        return;
      }

      // Check if input is a valid number format (optional '+'/'-', digits, optional single '.')
      // Allow unfinished inputs like only '+'/'-' or a number ending with '.'
      if (
        !VALID_NUMBER_REGEX.test(
          _value || !INTERMEDIATE_NUMBER_REGEX.test(_value)
        )
      ) {
        // onError("Only numbers are allowed");
        return;
      }

      let digitCount = _value.replace(/[^0-9]/g, "").length;
      if (digitCount > 15) {
        if (e?.nativeEvent?.inputType === "insertFromPaste") {
          onChange(_value.slice(0, 15));
        }
        // onError("Maximum 15 digits allowed");
        return;
      }

      // Validate min/max constraints when we have a complete number
      // Note: Min/max validation is handled in useMemo above for real-time error display
      // We allow typing values outside the range for better UX, but show error state

      onChange(_value);
    };

    return (
      <>
        <TextField
          ref={ref}
          isDisabled={disabled}
          textType={QuestionType.SHORT_TEXT}
          type={"text"}
          value={value == null ? "" : value} // Handle null/undefined case (value == null checks both null and undefined)
          onChange={handleNumberChange}
          placeholder={placeholder || "Type your answer here..."}
          theme={theme}
          isCreator={isCreator}
          autoFocus={autoFocus}
          style={style}
          isRequired={isRequired}
          testId={testId || "number-input"}
          onFocus={onFocus}
          error={!isInputValid || !isValueValid}
        />
      </>
    );
  }
);
