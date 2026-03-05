export const autoCompleteStyles = {
  autocomplete: {
    getListOptionStyles: () => {
      return {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        wordBreak: "break-all",
      };
    },

    chip: () => {
      return {
        "&.MuiAutocomplete-tag": {
          margin: "0px !important",
          background: "#000 !important",
          color: "#fff",
          fontSize: "1em",
          height: "2em",
          borderRadius: "1.5em",
        },
      };
    },
    listbox: () => {
      return {
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        backdropFilter: "blur(20px)",
        padding: "5px 8px",
        gap: "0.375rem",
      } as const;
    },
  },
} as any;
