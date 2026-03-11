import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTESheetIcon = (props) => {
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
        fill={`${background || "#68AD5D"}`}
      />
      <path
        d="M12 6.94734L12 16.7368"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M17.2107 6.94729L17.2107 17.2104"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M6.78955 6.94729L6.78955 17.2104"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M16.7369 12.3159L7.26318 12.3159"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M17.0527 6.94739L6.78955 6.94739"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M17.2106 17.2105L6.78955 17.2104"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
    </SvgIcon>
  );
};
