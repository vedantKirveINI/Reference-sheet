import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const TINYWorkflowIcon = (props) => {
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
        fill="url(#paint0_linear_4473_76519)"
      />
      <path
        d="M40.5327 53.8637H26.4873V36.1598L26.5625 36.0595L34.5562 26.5121L37.438 23.0791L38.2524 22.1018H55.1545V36.1472H40.5327V53.8512V53.8637Z"
        fill="white"
      />
      <path
        d="M55.4431 39.4801H69.4885V57.1841L69.4133 57.2843L61.4196 66.8317L58.5378 70.2648L57.7234 71.242H40.8213V57.1966H55.4431V39.4926V39.4801Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_4473_76519"
          x1="134.628"
          y1="-34.4056"
          x2="4.08457"
          y2="89.7729"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#358CFF" />
          <stop offset="0.16" stopColor="#3385F6" />
          <stop offset="0.41" stopColor="#2D73DF" />
          <stop offset="0.72" stopColor="#2555BA" />
          <stop offset="1" stopColor="#1C3693" />
        </linearGradient>
      </defs>
    </SvgIcon>
  );
};
