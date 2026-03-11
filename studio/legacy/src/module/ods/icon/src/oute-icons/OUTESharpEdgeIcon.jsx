import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';

const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTESharpEdgeIcon = (props) => {
  return (
    <SvgIcon
      viewBox="0 0 21 14"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#000",
        ...props.sx,
      }}
    >
      <path d="M21 0L0 0V14H21V13H1V1H21V0Z" />
    </SvgIcon>
  );
};
