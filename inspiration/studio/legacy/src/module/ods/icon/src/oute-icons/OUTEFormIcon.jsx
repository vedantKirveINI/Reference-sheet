import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEFormIcon = (props) => {
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
      <path
        d="M21.2369 0H2.78748C1.248 0 0 1.24673 0 2.78465V21.2153C0 22.7533 1.248 24 2.78748 24H21.2369C22.7764 24 24.0243 22.7533 24.0243 21.2153V2.78465C24.0243 1.24673 22.7764 0 21.2369 0Z"
        fill={`${background || "url(#paint0_linear_18378_61506)"}`}
      />
      <path
        d="M11.0179 18.0534H6.72852V10.2382L6.7536 10.21L9.19303 7.2969L10.071 6.2507L10.3187 5.95312H16.7057V10.2413H11.0148V18.0565L11.0179 18.0534Z"
        fill={`${color || "white"}`}
      />
      <path
        d="M16.5872 12.3086H12.7148V16.177H16.5872V12.3086Z"
        fill={`${color || "white"}`}
      />
      <defs>
        <linearGradient
          id="paint0_linear_18378_61506"
          x1="22.4848"
          y1="0.0751759"
          x2="-2.18851"
          y2="28.2253"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFBA08" />
          <stop offset="0.21" stopColor="#FFB210" />
          <stop offset="0.54" stopColor="#FF9F27" />
          <stop offset="0.95" stopColor="#FF7F4C" />
          <stop offset="1" stopColor="#FF7B52" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
