import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const ChatViewIcon = (props) => {
  return (
    <SvgIcon
      viewBox={"0 0 64 41"}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...props.sx,
      }}
    >
      <g clipPath="url(#clip0_13754_9084)">
        <path
          d="M32.5898 9.80546C32.5898 8.06836 31.1816 6.66016 29.4445 6.66016H3.49583C1.75873 6.66016 0.350529 8.06835 0.350529 9.80546V20.814H29.4445C31.1816 20.814 32.5898 19.4058 32.5898 17.6687V9.80546Z"
          fill={props?.sx?.color || "#90a4ae"}
        />
        <path
          d="M37.832 33.3938C37.832 35.1309 39.2402 36.5391 40.9773 36.5391H62.9944V28.6758C62.9944 26.9387 61.5862 25.5305 59.8491 25.5305H40.9773C39.2402 25.5305 37.832 26.9387 37.832 28.6758V33.3938Z"
          fill={props?.sx?.color || "#90a4ae"}
        />
      </g>
    </SvgIcon>
  );
};
