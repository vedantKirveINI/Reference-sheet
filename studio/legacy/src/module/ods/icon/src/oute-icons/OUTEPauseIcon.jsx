import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEPauseIcon = (props) => {
  return (
    <SvgIcon
      viewBox={`0 0 24 24`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props.sx,
      }}
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </SvgIcon>
  );
};
