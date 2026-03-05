import { useState, useEffect, useRef, forwardRef, KeyboardEvent, KeyboardEventHandler, CSSProperties, ReactNode, Ref, HTMLAttributes } from "react";
import { getMcqOptionContainerStyle, getMcqOptionEditorStyle, getWrapperStyles, getErrorStyles } from "./styles";
import LeftIcon from "./components/left-icon";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type inputType = "Radio" | "Checkbox";
type RightIconPropsWithRef = HTMLAttributes<HTMLDivElement> & {
  ref?: Ref<HTMLDivElement>;
};

export interface WrappedEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  inputType?: inputType;
  value: string;
  onValueChange: (value: string, event?: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  isSelected?: boolean;
  onLeftIconClick?: () => void;
  leftIcon?: ReactNode | string;
  rightIcon?: ReactNode | string;
  hoverIcon?: ReactNode | string;
  onClick?: () => void;
  rightIconProps?: RightIconPropsWithRef;
  customStyle?: {
    container?: CSSProperties;
    icon?: CSSProperties;
    input?: CSSProperties;
  };
  placeholder?: string;
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onInputKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  theme?: Record<string, unknown>;
  dataTestId?: string;
  error?: string | null;
  disabled?: boolean;
  autoFocus?: boolean;
  isReadOnly?: boolean;
  dataNodeType?: string;
  inputProps?: React.ComponentProps<typeof Textarea>;
  /** When false, textarea height auto-expands with content. Default true. */
  disableAutoResize?: boolean;
  /** When false, no click (press) animation. Default true. Set false in creator. */
  enableClickAnimation?: boolean;
}

export const WrappedEditor = forwardRef(
  (
    {
      value,
      onLeftIconClick,
      leftIcon,
      rightIcon,
      hoverIcon,
      onValueChange,
      onClick = () => {},
      customStyle = {},
      rightIconProps = {},
      isSelected,
      inputType,
      onKeyDown = () => {},
      onInputKeyDown,
      placeholder,
      theme = {},
      dataTestId = "wrapped-editor",
      error = null,
      disabled = false,
      autoFocus = false,
      isReadOnly = false,
      dataNodeType,
      inputProps = {},
      disableAutoResize = false,
      enableClickAnimation = true,
    }: WrappedEditorProps,
    ref: Ref<HTMLDivElement>
  ) => {
    const [isHover, setIsHover] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isValid = !Boolean(error);

    useEffect(() => {
      if (!disabled && textareaRef.current && autoFocus) {
        textareaRef.current.focus();
        textareaRef.current.select();
      }
    }, [disabled, autoFocus]);

    useEffect(() => {
      const el = textareaRef.current;
      if (!el || disableAutoResize) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [value, disableAutoResize]);

    return (
      <div
        className={cn(
          "group",
          !disabled && enableClickAnimation && "select-none transition-transform duration-150 ease-out active:scale-[0.98]"
        )}
        data-node-type={dataNodeType ?? ""}
        ref={ref}
        style={getMcqOptionContainerStyle({
          style: customStyle?.container,
          isSelected,
          isValid,
          disabled,
          theme,
        })}
        onMouseEnter={() => setIsHover(disabled ? false : true)}
        onMouseLeave={() => setIsHover(false)}
        onClick={() => {
          if (!disabled) {
            onClick();
          }
        }}
        onKeyDown={(e) => {
          if (!disabled) {
            onKeyDown?.(e);
          }
        }}
        data-testid={dataTestId}
      >
        <div className="wrapped-editor-inner-row flex w-full items-center justify-start gap-2" style={getWrapperStyles()}>
          {leftIcon && (
            <LeftIcon
              theme={theme}
              disabled={disabled}
              inputType={inputType}
              isHover={isHover}
              isSelected={isSelected && isValid}
              hoverIcon={hoverIcon}
              key={"Left-icon"}
              leftIcon={leftIcon}
              onLeftIconClick={onLeftIconClick}
              style={customStyle?.icon}
            />
          )}

          <Textarea
            ref={textareaRef}
            readOnly={isReadOnly}
            onFocus={() => {
              if (!isReadOnly) {
                textareaRef.current?.select();
              }
            }}
            value={value}
            onChange={(e) => {
              onValueChange(e.target.value, e);
            }}
            placeholder={placeholder}
            rows={1}
            style={{
              ...getMcqOptionEditorStyle({ theme }),
              pointerEvents: !disabled ? "auto" : "none",
              resize: "none",
              overflow: disableAutoResize ? "auto" : "hidden",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              minHeight: "2rem",
              paddingTop: "0.375rem",
              paddingBottom: "0.375rem",
              ...customStyle?.input,
            }}
            className={cn(
              "flex-1 min-w-0 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            )}
            tabIndex={!disabled ? 1 : -1}
            onKeyDown={onInputKeyDown}
            data-testid="wrapped-editor-input"
            aria-invalid={!isValid}
            aria-readonly={isReadOnly}
            disabled={disabled}
            {...inputProps}
          />

          {rightIcon && (
            <div
              className={cn(
                "mcq-drag-handler-icon flex h-6 w-6 shrink-0 cursor-grab items-center justify-center rounded border-0 bg-transparent p-0 opacity-50 transition-opacity group-hover:opacity-100"
              )}
              data-testid="wrapped-editor-right-icon"
              {...rightIconProps}
            >
              {rightIcon}
            </div>
          )}
        </div>
        <AnimatePresence>
          {!isValid && (
            <motion.span
              key="error"
              style={getErrorStyles()}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                opacity: { duration: 0.2, ease: "easeInOut" },
                height: { duration: 0.2, ease: "easeInOut" },
              }}
              data-testid={`${dataTestId}-warning`}
            >
              {error}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    );
  }
);
