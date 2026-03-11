import { INPUT_HEIGHT } from "../../../constants/constants";

export const styles = {
  container: (style) => {
    return {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      gap: "0.85em",
      "& .MuiAutocomplete-root": {
        minWidth: "7.5em !important",
      },
      "& .MuiInputBase-root": {
        padding: "0.5em 0.75em !important",
        height: "100%",
      },
      "& .MuiFormControl-root": {
        height: "100%",
      },
      //   "& .MuiInputBase-input": {
      //     padding: "0px !important",
      //     color: "#263238 !important",
      //     fontSize: "0.9em",
      //   },
      //   "& .MuiOutlinedInput-notchedOutline": {
      //     border: "0.5px solid rgba(0, 0, 0, 0.2)",
      //   },
      ...style,
    } as const;
  },
  label: {
    color: "#263238",
    fontFamily: "Inter",
    fontSize: "1em",
    fontStyle: "normal",
    fontWeight: 400,
    letterSpacing: "0.03125em",
    textWrap: "nowrap",
  } as const,
  inputContainer: (style) => {
    return {
      width: "100%",
      display: "flex",
      gap: "1em",
      ...style,
      height: INPUT_HEIGHT,
    };
  },
  inputStyle: {
    minWidth: "5em",
    maxWidth: "12em",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(16px)",
    opacity: 0.95,
    outline: "none",
    border: "0.75px solid rgba(0, 0, 0, 0.20)",
    borderRadius: "0.75em",
    fontSize: "1.15em",
    fontFamily: "Helvetica Neue",
    padding: "1em",
    boxSizing: "border-box",
    color: "#000",
    "::placeholder": {
      color: "#607D8B",
      opacity: 1,
    },
    input: {
      ":focus": {
        boxShadow: "rgb(70, 148, 226) 0px 0px 1px 2px inset",
      },
    },
  },
};
