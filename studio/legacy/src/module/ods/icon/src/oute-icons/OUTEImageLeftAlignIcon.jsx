import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';

const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTEImageLeftAlignIcon = (props) => {
  return (
    <SvgIcon
      viewBox="0 0 77 48"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props.sx,
      }}
    >
      <path
        d="M32.1822 0.287109H3.89648C2.23963 0.287109 0.896484 1.63026 0.896484 3.28711V48.7157C0.896484 50.3726 2.23963 51.7157 3.89648 51.7157H32.1822C33.839 51.7157 35.1822 50.3726 35.1822 48.7157V3.28711C35.1822 1.63026 33.839 0.287109 32.1822 0.287109Z"
        fill={props.sx.color || "#90a4ae"}
      />
      <path
        d="M46.3262 20.75C46.3262 20.3358 46.662 20 47.0762 20H81.5762C81.9904 20 82.3262 20.3358 82.3262 20.75C82.3262 21.1642 81.9904 21.5 81.5762 21.5H47.0762C46.662 21.5 46.3262 21.1642 46.3262 20.75Z"
        fill={props.sx.color || "#90a4ae"}
      />
      <path
        d="M46.3262 20.75C46.3262 20.3358 46.662 20 47.0762 20H81.5762C81.9904 20 82.3262 20.3358 82.3262 20.75C82.3262 21.1642 81.9904 21.5 81.5762 21.5H47.0762C46.662 21.5 46.3262 21.1642 46.3262 20.75Z"
        fill={props.sx.color || "#90a4ae"}
      />
      <path
        d="M46.3262 31.248C46.3262 30.8338 46.662 30.498 47.0762 30.498H69.5762C69.9904 30.498 70.3262 30.8338 70.3262 31.248C70.3262 31.6623 69.9904 31.998 69.5762 31.998H47.0762C46.662 31.998 46.3262 31.6623 46.3262 31.248Z"
        fill={props.sx.color || "#90a4ae"}
      />
    </SvgIcon>
  );
};
