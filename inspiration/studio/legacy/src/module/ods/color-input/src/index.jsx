import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// import default_theme from "oute-ds-shared-assets";
import sharedAssets from "../../shared-assets/src/index.jsx";
const default_theme = sharedAssets;
import { MuiColorInput } from "mui-color-input";
const theme = createTheme({
  ...default_theme,
  components: {
    MuiFormControl: {
      styleOverrides: {
        root: {
          display: "flex",
          width: "9.375rem",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          paddingRight: "0rem",
        },
        root: {
          borderRadius: "0.75rem",
        },
        notchedOutline: {
          top: "0rem",
          "& legend": {
            display: "none",
          },
        },
      },
    },
  },
});

const ODSColorInput = ({
  defaultColor = "#000000",
  onColorChange = () => { },
  ...props
}) => {
  const [value, setValue] = useState(defaultColor);
  const handleColorChange = (color) => {
    setValue(color);
    onColorChange(color);
  };
  return (
    <ThemeProvider theme={theme}>
      <MuiColorInput
        value={value}
        isAlphaHidden={true}
        variant="outlined"
        size="small"
        format="hex"
        {...props}
        onChange={handleColorChange}
      />
    </ThemeProvider>
  );
};

export default ODSColorInput;
