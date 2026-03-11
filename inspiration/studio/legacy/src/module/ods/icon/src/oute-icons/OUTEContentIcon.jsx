import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEContentIcon = (props) => {
  const { background, color, ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
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
        fill={`${background || "#4796EC"}`}
      />
      <path
        d="M6.1579 9.63159H18"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M6.15789 14.2104H14.6842"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};
