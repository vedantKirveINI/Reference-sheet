import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEDeveloperGuideIcon = (props) => {
  return (
    <SvgIcon
      viewBox={`0 -960 960 960`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props?.sx,
      }}
    >
      <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-640v560h560v-560h-80v280l-100-60-100 60v-280H200Zm0 560v-560 560Z" />
    </SvgIcon>
  );
};
