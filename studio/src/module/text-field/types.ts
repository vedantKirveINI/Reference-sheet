import { FocusEventHandler } from "react";

// We are ensuring `disabled` can't be used since we are using `isDisabled`
export interface TextFieldProps {
  isRequired?: boolean;
  /**
   * Affects the visual style of the text field.
   */
  theme?: any;

  isDisabled?: boolean;

  /**
   * A `testId` prop is provided for specified elements, which is a unique
   * string that appears as a data attribute `data-testid` in the rendered code,
   * serving as a hook for automated tests.
   */
  testId?: string;

  /**
   * Placeholder text to display in the text field whenever it is empty.
   */
  placeholder?: string;

  /**
   * Handler called when the inputs value changes.
   */
  onChange?: (e: any, value: string) => void;

  //  Will be fired when user blurs the input
  onBlur?: FocusEventHandler<HTMLElement>;

  //  Will be fired when user focuses the input
  onFocus?: any;

  // for defining value
  value?: any;

  // For defining max length of the input
  maxLength?: number;

  // Error message or state for validation errors
  error?: string | boolean;

  // /**
  //  * Element after input in text field.
  //  */
  // elemAfterInput?: React.ReactNode;

  // /**
  //  * Element before input in text field.
  //  */
  // elemBeforeInput?: React.ReactNode;

  /**
   * Name of the input element.
   */
  name?: string;
  minimumRows?: number;
  textType?: string;
  isCreator?: boolean;
  style?: object;
  highlightBorderOnFocus?: boolean;
  type?: "text" | "email" | "password" | "number";
  inputStyles?: React.CSSProperties;
  textTransformCase?: any;
  autoFocus?: boolean;
  /**
   * Controls whether the Enter key should be prevented from creating new lines.
   * When true, Enter key presses will be prevented (useful for single-line inputs).
   * When false or undefined, Enter key behavior is not modified.
   */
  preventEnterKey?: boolean;
  viewPort?: string;
}
