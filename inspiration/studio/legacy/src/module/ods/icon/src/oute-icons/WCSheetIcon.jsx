import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const WCSheetIcon = (props) => {
  const { color, background, ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
  return (
    <SvgIcon
      viewBox={`0 0 24 24`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...rest,
      }}
    >
      <rect
        width="24"
        height="24"
        rx="7.57895"
        fill={`${background || "#369B7D"}`}
      />
      <path
        d="M9.87479 20.5544H15.0007V10.1626L9.87479 4.0869L9.80369 4H3V10.1626H9.87479V20.5544Z"
        fill={`${color || "white"}`}
      />
      <path d="M21.0003 4H15V10.1119H21.0003V4Z" fill={`${color || "white"}`} />
    </SvgIcon>
  );
};
