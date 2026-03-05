import { QuestionType } from "@oute/oute-ds.core.constants";

const getBorderBottom = ({ ismaxLengthExceeded, focus, isCreator, theme }) => {
  if (ismaxLengthExceeded && !isCreator) {
    return "2px solid #C83C3C";
  }
  if (focus) {
    return `2px solid ${theme?.styles?.buttons}`;
  }
  return `1px solid ${theme?.styles?.buttons}`;
};
export const getContainerStyle = (options: any) => {
  const { style, ismaxLengthExceeded, focus, isCreator, theme } = options;

  return {
    position: "relative" as const,
    display: "flex",
    alignItems: "center" as const,
    opacity: 0.95,
    justifyContent: "space-between" as const,
    borderBottom: getBorderBottom({
      ismaxLengthExceeded,
      focus,
      isCreator,
      theme,
    }),
    fontSize: "1.1em",
    fontFamily: "Helvetica Neue",
    ...style,
    boxSizing: "border-box" as const,
  };
};

export const getInputStyle = ({
  theme = {},
  inputStyles,
  isCreator = false,
}: any) => {
  return {
    outline: "none",
    border: 0,
    flex: 1,
    fontSize: "1.15em",
    padding: "0.625em 0em",
    fontFamily: `${theme?.styles?.fontFamily || "Helvetica Neue"} !important`,
    color: theme?.styles?.buttons, //isCreator ? "rgb(96, 125, 139)" : theme?.styles?.answer,
    opacity: isCreator ? "0.7" : "0.95",
    ...inputStyles,
    backgroundColor: "transparent !important",
    maxHeight: "18.35em",
    resize: "none",
    MozAppearance: "textfield",
  };
};

export const INPUT_CLASSES = "scrollbar-medium input-placeholder-themed input-selection-highlight hide-spin-buttons";

export const getLimitTextStyle = ({ textType, theme = {} }: any) => {
  if (textType === QuestionType.LONG_TEXT) {
    return {
      position: "absolute",
      right: "1em",
      bottom: "0.2em",
      fontFamily: `${theme?.styles?.fontFamily || "Helvetica Neue"} !important`,
      color: theme?.styles?.buttons,
      fontWeight: "400",
      fontSize: "1em",
    } as const;
  }
  return {
    fontFamily: `${theme?.styles?.fontFamily || "Helvetica Neue"} !important`,
    color: theme?.styles?.buttons,
    fontWeight: "400",
    fontSize: "1em",
    marginLeft: "1em",
  };
};
