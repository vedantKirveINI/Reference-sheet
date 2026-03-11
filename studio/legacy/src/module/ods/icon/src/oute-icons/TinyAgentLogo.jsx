import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const TinyAgentLogo = (props) => {
  return (
    <SvgIcon
      viewBox="0 0 56 56"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...props.sx,
      }}
      data-testid="TinyAgentLogo"
    >
      <rect
        width="56"
        height="56"
        rx="6"
        fill={props?.fill || "url(#paint0_linear_1134_5838)"}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M33.8946 14.0605H43.9999V24.3538H43.9286L44.0006 24.4392V41.9403H35.368V24.4392H32.2106H23.79H20.6326V41.9403H12V24.4392L20.6326 14.2069L20.7524 14.0606H23.79H32.2106H33.8946V14.0605ZM23.79 29.2177H32.2106V37.6384H23.79V29.2177Z"
        fill={props?.color || "white"}
      />
      <defs>
        <linearGradient
          id="paint0_linear_1134_5838"
          x1="0"
          y1="0"
          x2="56"
          y2="56"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8133F1" />
          <stop offset="1" stopColor="#360083" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
