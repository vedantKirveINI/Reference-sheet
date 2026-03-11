import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const TINYMailIcon = (props) => {
  const { ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
  return (
    <SvgIcon
      viewBox="0 0 96 96"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...rest,
      }}
    >
      <path
        d="M84.8614 0H11.1386C4.98692 0 0 4.98692 0 11.1386V84.8614C0 91.0131 4.98692 96 11.1386 96H84.8614C91.0131 96 96 91.0131 96 84.8614V11.1386C96 4.98692 91.0131 0 84.8614 0Z"
        fill="url(#paint0_linear_4473_76543)"
      />
      <path
        d="M30.6923 64.8749C29.5558 64.8749 28.5938 64.4811 27.8062 63.6936C27.0187 62.9061 26.625 61.9441 26.625 60.8076V35.1923C26.625 34.0558 27.0187 33.0937 27.8062 32.3062C28.5938 31.5187 29.5558 31.125 30.6923 31.125H65.3076C66.4441 31.125 67.4061 31.5187 68.1936 32.3062C68.9811 33.0937 69.3749 34.0558 69.3749 35.1923V60.8076C69.3749 61.9441 68.9811 62.9061 68.1936 63.6936C67.4061 64.4811 66.4441 64.8749 65.3076 64.8749H30.6923ZM47.9999 48.8826C48.1874 48.8826 48.3735 48.8544 48.5581 48.7982C48.7427 48.7419 48.9216 48.6648 49.0946 48.5667L65.1865 38.2642C65.4432 38.1056 65.625 37.9001 65.7317 37.6477C65.8384 37.3953 65.8701 37.1292 65.8269 36.8494C65.798 36.3302 65.5442 35.9444 65.0653 35.692C64.5865 35.4396 64.1033 35.4619 63.6158 35.759L47.9999 45.7499L32.384 35.759C31.8965 35.4619 31.417 35.4381 30.9454 35.6877C30.4738 35.9371 30.2163 36.3172 30.173 36.8277C30.1297 37.1306 30.1615 37.4119 30.2682 37.6715C30.3749 37.9311 30.5566 38.1287 30.8134 38.2642L46.9053 48.5667C47.0783 48.6648 47.2572 48.7419 47.4418 48.7982C47.6264 48.8544 47.8124 48.8826 47.9999 48.8826Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4473_76543"
          x1="108.149"
          y1="-18"
          x2="-59"
          y2="149.149"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EC3957" />
          <stop offset="0.396778" stopColor="#F24F54" />
          <stop offset="0.95" stopColor="#FF7F4C" />
          <stop offset="1" stopColor="#FF7B52" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
