import { Mode } from "@oute/oute-ds.core.constants";

export const getQuestionAlignmentContainerStyles = (style, disabled) => {
  return {
    position: "relative",
    width: "100%",
    display: "grid",
    alignItems: "center",
    gap: "1em",
    filter: disabled ? "opacity(0.5)" : "none",
    ...style,
  } as const;
};

export const getAlignmentTabsContainerStyle = ({
  mode,
  disabled,
}: {
  mode: Mode;
  disabled: boolean;
}) => {
  return {
    position: "absolute",
    width: "6em",
    height: "3em",
    display: "grid",
    gap: "0.3em",
    gridTemplateColumns: "auto auto",
    overflow: "hidden",
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
};
export const getQuestionAlignmentTextStyles = () => {
  return {
    marginLeft: "6.5em",
  } as const;
};
export const getAlignmentTabContainerStyle = ({ isSelected }) => {
  return {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: isSelected ? "black" : "white",
    color: isSelected ? "white" : "black",
    borderRadius: "0.375em",
  } as const;
};
