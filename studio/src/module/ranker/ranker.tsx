import React, { forwardRef } from "react";
import { DraggableAttributes } from "@dnd-kit/core";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import DragIndicatorIcon from "./assets/icons/drag-indicator-icon";
import CrossIcon from "./assets/icons/cross-icon";
import { styles } from "./styles";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DropDownIcon from "./assets/icons/drop-down-icon";
import { motion, AnimatePresence } from "framer-motion";
interface IValue {
  rank: string | number | React.ReactNode | null;
  label: string | number;
}

type RankerProps<T> = {
  index: number;
  isCreator: boolean;
  onRankChange: ({
    rank,
    index,
  }: {
    rank: IValue["rank"];
    index: number;
  }) => void;
  value: IValue;
  onValueChange: ({ data, index }: { data: string; index: number }) => void;
  dropDownOptions?: T[];
  onDelete: (id: number) => void;
  showDeleteButton?: boolean;
  style?: any;
  isHandleActive?: boolean;
  attributes?: DraggableAttributes;
  listeners?: SyntheticListenerMap | undefined;
  handleProps?: any;
  isDragging?: boolean;
  theme?: any;
};

const Ranker = forwardRef<HTMLDivElement, RankerProps<any>>(
  (
    {
      index,
      isCreator,
      onDelete,
      showDeleteButton = true,
      value,
      onValueChange,
      onRankChange,
      dropDownOptions,
      style = {},
      attributes,
      handleProps,
      isHandleActive,
      listeners,
      isDragging,
      theme,
    }: RankerProps<any>,
    ref
  ): any => {
    const { label, rank } = value;
    const [isInputFocus, setIsInputFocus] = React.useState<boolean>(false);
    const inputRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [isCharLimitExceeded, setIsCharLimitExceeded] = React.useState(false);

    const timeoutRef = React.useRef(null);
    const handleValueChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value.slice(0, 150);
      const isExceeded = e.target.value.length > 150;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsCharLimitExceeded(isExceeded);

      if (isExceeded) {
        timeoutRef.current = setTimeout(() => {
          setIsCharLimitExceeded(false);
        }, 5000);
      }
      onValueChange({ data: newValue, index });
    };

    const handleContainerClick = () => {
      if (isCreator) {
        inputRef.current?.focus();
        setIsInputFocus(true);
      }
    };

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, []);

    React.useEffect(() => {
      if (inputRef.current) {
        if (inputRef) {
          // Reset height so scrollHeight can be calculated correctly
          inputRef.current.style.height = "auto";
          inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
      }
    }, [label]);

    return (
      <div
        className="group"
        style={{ ...styles.container({ isCreator, theme }), ...style }}
        onClick={handleContainerClick}
        onBlur={() => {
          if (isCreator) {
            setIsInputFocus(false);
          }
        }}
        ref={ref}
        {...(!isHandleActive ? listeners : undefined)}
        {...attributes}
        tabIndex={!isHandleActive ? 0 : undefined}
        data-testid={`ranker-${index}-container`}
      >
        <div
          style={styles.rankerContainer({
            isInputFocus,
            isCreator,
            isCharLimitExceeded,
            theme,
          })}
        >
          <div
            style={styles.dropDownContainer}
            data-testid={`ranker-${index}-dropdown-container`}
          >
            {isCreator ? (
              <>
                <span style={styles.text}>{Boolean(rank) ? rank : "--"}</span>
                <DropDownIcon data-testid={`ranker-${index}-dropdown-icon`} />
              </>
            ) : (
              <Select
                value={rank != null && rank !== "" ? String(rank) : ""}
                onValueChange={(newValue) => {
                  onRankChange({
                    rank: newValue ? Number(newValue) : null,
                    index,
                  });
                }}
              >
                <SelectTrigger
                  className="flex h-[1.75em] min-h-0 w-full min-w-0 items-center justify-between gap-[0.375em] border-0 bg-transparent p-0 pr-0 text-[1.25em] shadow-none outline-none focus:ring-0 [&>span:first-child]:flex [&>span:first-child]:min-w-0 [&>span:first-child]:flex-1 [&>span:first-child]:justify-center [&>svg]:h-[1em] [&>svg]:w-[1em] [&>svg]:shrink-0"
                  data-testid={`ranking-${index}-dropdown`}
                >
                  <SelectValue placeholder="--" />
                </SelectTrigger>
                <SelectContent>
                  {(dropDownOptions ?? []).map((option) => (
                    <SelectItem
                      key={option}
                      value={String(option)}
                    >
                      {String(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div style={styles.errorTextContainerStyle}>
            <textarea
              ref={inputRef}
              rows={1}
              value={label}
              onChange={handleValueChange}
              placeholder={`Option ${index + 1}`}
              style={styles.textarea(theme)}
              onFocus={() => setIsInputFocus(true)}
              onBlur={() => setIsInputFocus(false)}
              disabled={!isCreator}
              data-testid={`ranker-${index}-input`}
            />
            <AnimatePresence>
              {isCharLimitExceeded && (
                <motion.span
                  key="error-message"
                  style={styles.errorMessage}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.3, ease: "easeInOut" },
                    height: { duration: 0.3, ease: "easeInOut" },
                  }}
                >
                  CHARACTER LIMIT OF 150 EXCEEDED
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <DragIndicatorIcon
            width={"1.75em"}
            height={"1.75em"}
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            {...listeners}
            {...handleProps}
            data-testid={`ranker-${index}-drag-icon`}
          />
          <div className="ripple" style={styles.ripple}></div>
        </div>
        {isCreator && showDeleteButton && (
          <div
            className="ranker-delete-container hidden group-hover:flex"
            style={styles.deleteContainer}
            onClick={() => {
              onDelete(index);
            }}
            role="button"
            tabIndex={1}
            aria-label="Delete Option Button"
            data-testid={`ranker-${index}-delete-button`}
          >
            <CrossIcon width={"1.5em"} height={"1.5em"} />
          </div>
        )}
      </div>
    );
  }
);

export { Ranker };
export type { RankerProps };
