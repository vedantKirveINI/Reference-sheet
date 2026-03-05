import {
  DateFormat,
  DateFormatSeparator,
} from "@oute/oute-ds.common.core.utils";

export interface IDateInputValue {
  value: string;
  ISOValue: string;
}

type TODO = any;

export type DateInputProps = {
  value: IDateInputValue;
  onChange: (value: IDateInputValue, options?: TODO) => void;
  onSelect?: (value: IDateInputValue, options?: TODO) => void;
  error?: string;
  autoFocus?: boolean;
  theme?: TODO;
  format?: DateFormat;
  separator?: DateFormatSeparator;
  enableCalender?: boolean;
  style?: TODO;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  dataTestId?: string;
  /** Compact size for use in settings panels; default is "default" */
  size?: "default" | "sm";
  /** "underline" = bottom border only (default); "bordered" = full enclosed border to match Select/Input in settings */
  inputVariant?: "underline" | "bordered";
};
