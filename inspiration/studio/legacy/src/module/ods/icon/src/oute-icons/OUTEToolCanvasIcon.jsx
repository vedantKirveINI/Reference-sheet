import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEToolCanvasIcon = (props) => {
  return (
    <SvgIcon
      viewBox={`0 0 24 24`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...props.sx,
      }}
    >
      <path
        d="M32 0V10.293H31.9287L32.001 10.3789V27.8789H23.3682V10.3789H8.63281V27.8789H0V10.3789L8.63281 0.146484L8.75195 0H32ZM20.2109 23.5771H11.79V15.1572H20.2109V23.5771Z"
        fill="url(#paint0_linear_2795_23050)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_2795_23050"
          x1="0"
          y1="0"
          x2="27.6159"
          y2="31.6991"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#8133F1" />
          <stop offset="1" stop-color="#360083" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
