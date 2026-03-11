import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  container: {
    margin: "1em 0",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "3.31em",
  },
  wrapperContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "3em",
  },

  defaultValueContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "1em",
  },
  wrapperContainerStyle: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.8em",
    paddingRight: "0.8em",
  } as const,

  textArea: {
    width: "100%",
    height: INPUT_HEIGHT,
    color: "#000",
    padding: "0.8em",
    background: "#FFF",
    transition: "all .3s ease",
    fontFamily: "Noto Sans",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    lineHeight: "110%",
    letterSpacing: "0.016em",
    borderRadius: "0.375em",
    border: "0.047em solid rgba(0, 0, 0, 0.2)",
    outline: "none",
    ":hover": {
      outline: "0.047em solid rgb(0, 0, 0)",
    },
  },
} as const;

export const INPUT_CLASSES = "input-placeholder-themed";
