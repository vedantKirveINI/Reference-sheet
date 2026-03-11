import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const CardViewIcon = (props) => {
  return (
    <SvgIcon
      viewBox={"0 0 63 18"}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...props.sx,
      }}
    >
      <rect
        x="0.474609"
        y="0.949219"
        width="61.9809"
        height="3.93162"
        rx="1.96581"
        fill={props?.sx?.color || "#90a4ae"}
      />
      <rect
        x="0.474609"
        y="7.24023"
        width="42.4615"
        height="2.35897"
        rx="1.17949"
        fill={props?.sx?.color || "#90a4ae"}
      />
      <rect
        x="0.474609"
        y="12.7441"
        width="9.4359"
        height="4.71795"
        rx="0.786325"
        fill={props?.sx?.color || "#90a4ae"}
      />
    </SvgIcon>
  );
};
