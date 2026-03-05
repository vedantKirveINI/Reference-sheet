import React, { useState, forwardRef } from "react";
import { QuestionType, ViewPort } from "@src/module/constants";
import { TextFieldProps } from "./types";
import transformText from "./utils/transformText";
import { ODSTextField } from "@src/module/ods";
import { cn } from "@/lib/utils";
export const TextField = forwardRef((props: TextFieldProps, ref) => {
  const {
    isDisabled,
    testId,
    onChange,
    value = "",
    placeholder,
    isRequired = false,
    maxLength,
    theme,
    name,
    minimumRows,
    textType = "SHORT_TEXT",
    isCreator,
    style,
    type = "text",
    inputStyles = {},
    textTransformCase,
    autoFocus,
    onFocus = () => {},
    preventEnterKey = false,
    viewPort = ViewPort.DESKTOP,
    error,
  } = props;

  const [focus, setFocus] = useState(false);
  const [ismaxLengthExceeded, setMaxLengthExceeded] = useState(false);

  const onCreatorChange = (e: any, value: string) => {
    onChange(e, value);
  };

  const onFillerChange = (e: any, value: string) => {
    onChange(e, value);
  };

  const onChangeHandler = (e: any, value?: string) => {
    // ODSTextField may pass (e, value) or just e
    const inputValue =
      value !== undefined ? value : e?.target?.value || e?.value || "";

    // Check if user is trying to exceed maxLength BEFORE slicing
    if (!isCreator && maxLength) {
      setMaxLengthExceeded(inputValue.length > maxLength);
    }

    if (!isCreator) {
      const processedValue = maxLength
        ? inputValue.slice(0, maxLength)
        : inputValue;
      if (textTransformCase) {
        const transformedText = transformText(
          processedValue,
          textTransformCase
        );
        onFillerChange(e, transformedText);
      } else {
        onFillerChange(e, processedValue);
      }
    } else {
      onCreatorChange(e, inputValue);
    }
  };

  // Prevents Enter key from creating new lines when preventEnterKey is true.
  // Allows Shift+Enter to create new lines.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isCreator && e.key === "Enter") {
      e.preventDefault();
      return;
    }

    if (preventEnterKey && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFocus(true);
    if (
      textType === QuestionType.LONG_TEXT &&
      e.target instanceof HTMLTextAreaElement
    ) {
      const length = e.target.value.length;
      if (length > 0) {
        setTimeout(() => {
          if (e.target) {
            e.target.setSelectionRange(length, length);
          }
        }, 0);
      }
    }
    onFocus();
  };

  const handleBlur = () => {
    setFocus(false);
  };

  // Character counter: when maxLength set; hide in creator (like Long Text); for Short Text always, for Long Text at 80%
  const showCharacterCounter = !!maxLength && !isCreator && (textType === QuestionType.SHORT_TEXT || (value?.length ?? 0) >= 0.8 * maxLength);
  const hasError = !!((ismaxLengthExceeded && !isCreator) || error);
  const ERROR_COLOR = "#C83C3C";
  // For Short Text, don’t show helper below the field — parent shows error (like Long Text)
  const effectiveHelperText = textType === QuestionType.SHORT_TEXT
    ? undefined
    : (error ? (typeof error === "string" ? error : undefined) : ismaxLengthExceeded && !isCreator ? "Maximum length exceeded" : undefined);

  // Container classes with Tailwind
  const containerClasses = cn(
    "relative flex items-center box-border w-full",
    "text-[1.1em] font-['Helvetica_Neue'] opacity-95",
    // Dynamic border bottom - include external errors
    (ismaxLengthExceeded && !isCreator) || error
      ? "border-b-2 border-b-[#C83C3C]"
      : "",
    !ismaxLengthExceeded && !error && focus && "border-b-2",
    !ismaxLengthExceeded && !error && !focus && "border-b"
    // Theme color via inline style for dynamic values
  );

  // Limit tracker classes — bottom-right for both Short and Long text; padding so text and counter don’t overlap
  const limitTrackerClasses = cn(
    "font-['Helvetica_Neue'] font-normal text-base pointer-events-none",
    (textType === QuestionType.LONG_TEXT || textType === QuestionType.SHORT_TEXT)
      ? "absolute right-4 bottom-[0.2em] pl-2"
      : "ml-4"
  );

  // Get theme color for border (use inline style for dynamic colors)
  const borderColor =
    (ismaxLengthExceeded && !isCreator) || error
      ? "#C83C3C"
      : theme?.styles?.buttons || "#000";

  const borderWidth =
    (ismaxLengthExceeded && !isCreator) || error
      ? "2px"
      : focus
      ? "2px"
      : "1px";

  const isShortTextWithCounter = showCharacterCounter && textType === QuestionType.SHORT_TEXT;
  // Counter as endAdornment: adornment has padding so gap comes from adornment, not absolute/hardcoded (like legacy)
  const shortTextCounterAdornment = isShortTextWithCounter ? (
    <div className="flex items-center shrink-0 pl-3 pr-0 py-0">
      <span
        className="tabular-nums text-sm pointer-events-none"
        style={{
          color: hasError ? ERROR_COLOR : theme?.fonts?.answerColor || theme?.styles?.buttons || "#000",
        }}
        data-testid="short-text-character-counter"
      >
        {(value?.toString().length ?? 0)}/{maxLength}
      </span>
    </div>
  ) : null;

  return (
    <div
      className={containerClasses}
      style={{
        borderBottom: `${borderWidth} solid ${borderColor}`,
        ...style,
      }}
      data-testid="text-field-container"
    >
      <ODSTextField
        ref={ref}
        fullWidth={true}
        variant="underline"
        multiline={textType === QuestionType.LONG_TEXT}
        rows={textType === QuestionType.LONG_TEXT ? minimumRows : undefined}
        value={value}
        placeholder={placeholder}
        onChange={onChangeHandler}
        isDisabled={isDisabled}
        isRequired={isRequired}
        testId={testId}
        textTransformCase={textTransformCase}
        type={type}
        isCreator={isCreator}
        theme={theme}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onBlur={handleBlur}
        error={!!((ismaxLengthExceeded && !isCreator) || error)}
        helperText={effectiveHelperText}
        InputProps={shortTextCounterAdornment ? { endAdornment: shortTextCounterAdornment } : undefined}
        inputProps={{
          maxLength,
          name,
          "data-testid": testId,
          "data-enable-grammarly":
            textType === QuestionType.LONG_TEXT ? "false" : undefined,
          ...(textType === QuestionType.LONG_TEXT && {
            onKeyDown: handleKeyDown,
          }),
        }}
        className={cn(
          "flex-1 outline-none border-0",
          "text-[1.15em] py-[0.625em]",
          !isCreator && "opacity-95",
          "bg-transparent max-h-[18.35em] resize-none",
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
        )}
        sx={{
          fontFamily: theme?.styles?.fontFamily || "Helvetica Neue",
          color: isCreator 
            ? (() => {
                // Keep original color priority for answer text
                const baseColor = theme?.styles?.buttons || theme?.styles?.description || theme?.fonts?.answerColor || "#263238";
                // Convert hex to rgba with 0.7 opacity (matching description) for creator mode
                if (baseColor.startsWith("#")) {
                  const hex = baseColor.replace("#", "");
                  const isShort = hex.length === 3;
                  const r = parseInt(isShort ? hex[0] + hex[0] : hex.substring(0, 2), 16);
                  const g = parseInt(isShort ? hex[1] + hex[1] : hex.substring(2, 4), 16);
                  const b = parseInt(isShort ? hex[2] + hex[2] : hex.substring(4, 6), 16);
                  return `rgba(${r}, ${g}, ${b}, 0.7)`;
                }
                return baseColor;
              })()
            : (theme?.styles?.buttons || theme?.styles?.description || theme?.fonts?.answerColor || "#263238"),
          ...inputStyles,
        }}
      />

      {/* Character counter for Long Text only — Short Text uses endAdornment above */}
      {showCharacterCounter && !isShortTextWithCounter && (
        <div
          className={limitTrackerClasses}
          style={{
            color: hasError ? ERROR_COLOR : theme?.styles?.buttons || theme?.fonts?.answerColor || "#000",
          }}
          data-testid="text-field-limit-tracker"
        >
          {isCreator ? 0 : (value?.toString().length ?? 0)}/{maxLength}
        </div>
      )}
    </div>
  );
});
