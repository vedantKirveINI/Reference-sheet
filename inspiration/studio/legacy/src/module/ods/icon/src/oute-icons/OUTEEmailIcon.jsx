import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEEmailIcon = (props) => {
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
        fill={`${background || "#ED5F59"}`}
      />
      <path
        d="M19.1053 7.10521L12 12.4736"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M4.89474 7.10521L12 12.4736"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};
