import { type UpdatePluginRef } from "./plugins/updatePlugin";

export type EditorProps = {
  // To add placeholder
  placeholder?: string;
  // To define whether it is in edit mode or not
  editable?: boolean;
  // This will return content in HTML format
  onChange?: any;
  // Styles which we can pass from props
  style?: any;
  // CSS class names
  className?: string;
  //  value, it can be html also
  value?: string;
  // Whther to select all content on focus or not
  selectAllOnFocus?: boolean;
  // theme
  theme?: any;
  //popper
  toolbarPlacement?: "up" | "down";
  //for writing test cases
  testId?: any;

  enableFXPicker?: boolean;

  enableSingleLineEditing?: boolean;
  enableRecall?: boolean;

  enableLinkCreation?: boolean;

  maxLength?: number;

  variables?: any;

  getAnswerByNodeId?: (nodeId: string) => void;

  autoFocus?: boolean;

  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void;

  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void;

  /** Applied to the inner content wrapper (e.g. width: "fit-content" so icon sits after text) */
  contentStyle?: React.CSSProperties;
};

export interface EditorRef extends UpdatePluginRef {
  focus: () => void;
  blur: () => void;
}
