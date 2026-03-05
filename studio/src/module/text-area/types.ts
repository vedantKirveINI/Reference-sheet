export interface TextAreaProps {
  /**
   * controls the appearance of the field.
   * subtle shows styling on hover.
   * none prevents all field styling.
   */
  appearance?: "standard" | "subtle" | "none";
  /**
   * Sets the field as uneditable, with a changed hover state.
   */
  isDisabled?: boolean;
  /**
   * Set required for form that the field is part of.
   */
  isRequired?: boolean;
  /**
   * The minimum number of rows of text to display
   */
  minimumRows?: number;
  /**
   * The value of the text-area.
   */
  value?: string;
  /**
   * Name of the input form control
   */
  name?: string;
  /**
   * The placeholder within the textarea
   */
  placeholder?: string;
  /**
   * Handler to be called when the input is blurred
   */
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
  /**
   * Handler to be called when the input changes.
   */
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  /**
   * Handler to be called when the input is focused
   */
  onFocus?: React.FocusEventHandler<HTMLTextAreaElement>;
  /**
   * A `testId` prop is provided for specified elements, which is a unique
   * string that appears as a data attribute `data-testid` in the rendered code,
   * serving as a hook for automated tests
   */
  testId?: string;
}

// TODO: DSP-2566 Move `Combine` type utility into @atlaskit/ds-lib https://product-fabric.atlassian.net/browse/DSP-2566
type Combine<First, Second> = Omit<First, keyof Second> & Second;
