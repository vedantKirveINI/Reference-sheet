import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const ClassicViewIcon = (props) => {
  return (
    <SvgIcon
      viewBox={"0 0 51 38"}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...props.sx,
      }}
    >
      <g clipPath="url(#clip0_13754_9051)">
        <rect
          x="0.589844"
          y="0.513672"
          width="49.5385"
          height="3.93162"
          rx="1.96581"
          fill={props?.sx?.color || "#90a4ae"}
        />
        <rect
          x="0.589844"
          y="6.80469"
          width="31.453"
          height="2.35897"
          rx="1.17949"
          fill={props?.sx?.color || "#90a4ae"}
        />
        <rect
          x="0.589844"
          y="15.4531"
          width="49.5385"
          height="3.93162"
          rx="1.96581"
          fill={props?.sx?.color || "#90a4ae"}
        />
        <rect
          x="0.589844"
          y="21.7441"
          width="20.4444"
          height="2.35897"
          rx="1.17949"
          fill={props?.sx?.color || "#90a4ae"}
        />
        <rect
          x="0.589844"
          y="30.3945"
          width="49.5385"
          height="3.93162"
          rx="1.96581"
          fill={props?.sx?.color || "#90a4ae"}
        />
        <rect
          x="0.589844"
          y="36.6855"
          width="41.6752"
          height="2.35897"
          rx="1.17949"
          fill={props?.sx?.color || "#90a4ae"}
        />
      </g>
    </SvgIcon>
  );
};
