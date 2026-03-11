import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const WCFormIcon = (props) => {
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
        fill={`${background || "#FFBA08"}`}
      />
      <path
        d="M11.1219 17.7095H6V10.0501L11.1219 4.08681L11.1887 4H18V10.0501H11.1219V17.7095Z"
        fill={`${color || "white"}`}
      />
      <path
        d="M17.9984 13.2754H13.4375V17.8363H17.9984V13.2754Z"
        fill={`${color || "white"}`}
      />
      <path
        d="M11.1219 10.8584H6V20.2541H11.1219V10.8584Z"
        fill={`${color || "white"}`}
      />
    </SvgIcon>
  );
};
