import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const FormIcon = (props) => {
  return (
    <SvgIcon
      viewBox={`0 0 24 24`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props.sx,
      }}
    >
      <path
        d="M10.9625 20.9953H4.58984V9.37267L4.62711 9.33075L8.25133 4.99845L9.55568 3.44255L9.92369 3H19.4128V9.37733H10.9579V21L10.9625 20.9953Z"
        fill={props?.sx?.color || "#90a4ae"}
      />
      <path
        d="M19.2375 12.4531H13.4844V18.2062H19.2375V12.4531Z"
        fill={props?.sx?.color || "#90a4ae"}
      />
    </SvgIcon>
  );
};
