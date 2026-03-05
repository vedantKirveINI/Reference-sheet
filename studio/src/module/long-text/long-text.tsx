import { ODSTextField } from "@src/module/ods";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Mode, QuestionType } from "@oute/oute-ds.core.constants";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { getTextTransformedValue } from "./utils/get-text-transformed-value";
import { cn } from "@/lib/utils";

export type LongTextProps = {
  /**
   * a node to be rendered in the special component.
   */
  question?: any;
  theme?: any;
  value: any;
  setValue?: any;
  onChange?: (value) => void;
  mode?: Mode;
  maxLength?: number;
  minimumRows?: number;
  isCreator?: boolean;
  placeholder?: any;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  isAnswered?: boolean;
  answers?: any;
  state?: any;
  onFocus?: any;
  helperText?: boolean;
  viewPort?: string;
};

export function LongText({
  value,
  onChange,
  maxLength,
  theme,
  isCreator,
  placeholder,
  error,
  question,
  autoFocus = false,
  disabled = false,
  isAnswered = false,
  answers = {},
  state = {},
  helperText = false,
  onFocus = () => {},
  mode = Mode.CARD,
}: LongTextProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [focus, setFocus] = useState(false);
  const textTransformCase = question?.settings?.textTransformation?.case;
  const defaultValue = question?.settings?.defaultValue;
  const handleOnChange = (_event, value) => {
    if (isCreator) {
      // In creator, new lines are not allowed (Enter/Shift+Enter disabled),
      // so remove newlines but preserve spaces (including trailing spaces).
      const sanitized = (value ?? "").toString().replace(/\r?\n/g, "");
      onChange(sanitized.slice(0, 150));
      return;
    }
    // Apply text case transformation when user types (same as Short Text / TextField)
    if (textTransformCase) {
      const str = (value ?? "").toString();
      const caseType = typeof textTransformCase === "string" ? textTransformCase.toLowerCase() : "none";
      const transformed = getTextTransformedValue(str, caseType);
      onChange(transformed !== undefined ? transformed : str);
      return;
    }
    onChange(value);
  };

  // ODSTextField may call onChange(e) (native textarea) or onChange(e, value)
  const onChangeHandler = (e: any, maybeValue?: string) => {
    const inputValue =
      maybeValue !== undefined ? maybeValue : e?.target?.value || "";
    handleOnChange(e, inputValue);
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

      if (question?.settings?.maxChar) {
        resolvedValue = resolvedValue?.slice(0, question?.settings?.maxChar);
      }
      return getTextTransformedValue(
        resolvedValue,
        textTransformCase.toLowerCase()
      );
    } catch (error) {
    }
  };

  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null && defaultValue !== "" && !isCreator && !isAnswered) {
      const resolvedValue = resolveFX();
      if (resolvedValue) {
        onChange(resolvedValue);
      }
    }
  }, []);

  const resizeToContent = () => {
    const el = textareaRef.current;
    if (!el) return;
    if (isCreator) {
      // In creator, grow with content and avoid internal scrollbars.
      el.style.overflowY = "hidden";
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    } else {
      // In preview, grow until max-height; after that, enable scrolling.
      el.style.height = "auto";
      const maxH = Number.parseFloat(window.getComputedStyle(el).maxHeight);
      if (Number.isFinite(maxH) && maxH > 0) {
        const nextH = Math.min(el.scrollHeight, maxH);
        el.style.height = `${nextH}px`;
        el.style.overflowY = el.scrollHeight > maxH ? "auto" : "hidden";
      } else {
        // Fallback: if no max-height is applied, just grow.
        el.style.height = `${el.scrollHeight}px`;
        el.style.overflowY = "hidden";
      }
    }
  };

  // Keep height in sync for default values, programmatic changes,
  // and layout / viewport toggles (desktop ↔ mobile).
  useLayoutEffect(() => {
    resizeToContent();
  });

  // Real-time validation for minChar/maxChar — same as Number component
  const isValueValid = useMemo(() => {
    if (isCreator || value == null || value === "") {
      return true; // Don't validate in creator mode or when empty
    }

    const valueStr = String(value);
    const minChar = question?.settings?.minChar;
    const maxChar = question?.settings?.maxChar;

    // Validate minChar constraint
    if (minChar && valueStr.length < minChar) {
      return false;
    }

    // Validate maxChar constraint (if exceeded, it's invalid)
    if (maxChar && valueStr.length > maxChar) {
      return false;
    }

    return true;
  }, [value, question?.settings?.minChar, question?.settings?.maxChar, isCreator]);

  // Red border on error — same as Number/TextField (#C83C3C, 2px)
  // Show red border if: external error OR real-time validation fails
  const ERROR_BORDER_COLOR = "#C83C3C";
  const hasError = !!error || (!isCreator && !isValueValid);
  const borderColor = hasError
    ? ERROR_BORDER_COLOR
    : theme?.styles?.buttons || "#000";
  const borderWidth = hasError ? "2px" : focus ? "2px" : "1px";

  const containerClasses = cn(
    "relative flex items-center box-border w-full",
    "text-[1.1em] font-['Helvetica_Neue'] opacity-95",
    hasError && "border-b-2 border-b-[#C83C3C]",
    !hasError && focus && "border-b-2",
    !hasError && !focus && "border-b"
  );

  // Character counter — show when maxChar is provided
  const maxChar = question?.settings?.maxChar || maxLength;
  const currentLength = value?.toString().length || 0;
  const showCharacterCounter = !isCreator && maxChar;

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setFocus(true);
    if (e.target instanceof HTMLTextAreaElement) {
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

  return (
    <div className="flex flex-col gap-1">
      <div
        className={containerClasses}
        style={{
          borderBottom: `${borderWidth} solid ${borderColor}`,
        }}
        data-testid="text-field-container"
      >
        <ODSTextField
          ref={textareaRef}
          fullWidth={true}
          variant="underline"
          multiline={true}
          rows={1}
          isDisabled={disabled}
          textType={QuestionType.LONG_TEXT}
          maxLength={maxLength}
          value={value}
          onChange={onChangeHandler}
          placeholder={placeholder || "Type your answer here..."}
          theme={theme}
          isCreator={isCreator}
          textTransformCase={textTransformCase}
          error={hasError}
          helperText={undefined}
          testId="long-text"
          autoFocus={autoFocus}
          onFocus={handleFocus}
          onBlur={handleBlur}
          inputProps={{
            onInput: resizeToContent,
            maxLength: isCreator ? 150 : maxLength,
            onPaste: (e: any) => {
              if (!isCreator) return;
              const el = textareaRef.current;
              if (!el) return;

              // Prevent multi-line / over-limit paste from introducing empty lines.
              e.preventDefault();
              const pastedRaw = e.clipboardData?.getData("text") ?? "";
              const pasted = pastedRaw.replace(/\r?\n/g, "");

              const current = (el.value ?? "").toString();
              const start = el.selectionStart ?? current.length;
              const end = el.selectionEnd ?? current.length;

              // Remove newlines from pasted content but preserve spaces
              const next = (current.slice(0, start) + pasted + current.slice(end))
                .slice(0, 150);

              onChange(next);
              // Keep textarea sized correctly after paste.
              setTimeout(resizeToContent, 0);
            },
            onKeyDown: (e: any) => {
              // In creator, do not allow Enter at all (including Shift+Enter).
              if (isCreator && e.key === "Enter") {
                e.preventDefault();
                return;
              }
              // Outside creator, keep existing behavior: prevent plain Enter in non-card modes.
              if (mode !== Mode.CARD && e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
              }
            },
          }}
          className={cn(
            "flex-1 outline-none border-0",
            "text-[1.15em] py-[0.625em]",
            !isCreator && "opacity-95",
            "bg-transparent max-h-[18.35em] resize-none",
            isCreator
              ? "w-full resize-none overflow-hidden"
              : "w-full resize-none max-h-[18.35em] overflow-y-auto",
            showCharacterCounter && "pr-14"
          )}
          sx={{
            fontFamily: theme?.styles?.fontFamily,
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
          }}
        />
        {/* Character counter — show when maxChar is provided; size matches Short Text counter (text-sm) */}
        {showCharacterCounter && (
          <div
            className="absolute right-4 bottom-[0.2em] font-['Helvetica_Neue'] font-normal text-sm pointer-events-none tabular-nums"
            style={{
              color: hasError ? ERROR_BORDER_COLOR : theme?.styles?.buttons || theme?.fonts?.answerColor || "#000",
            }}
            data-testid="long-text-character-counter"
          >
            {currentLength}/{maxChar}
          </div>
        )}
      </div>

      {helperText && (
        <span
          className="text-[0.95em] leading-[1em] font-normal"
          style={{
            fontFamily: theme?.styles?.fontFamily,
            color: theme?.styles?.buttons,
          }}
          data-testid="long-text-helper-text"
        >
          <strong>Shift ⇧ + Enter ↵</strong> to make a line break
        </span>
      )}
    </div>
  );
}
