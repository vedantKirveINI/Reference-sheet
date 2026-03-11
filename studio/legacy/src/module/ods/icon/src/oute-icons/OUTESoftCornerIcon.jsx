import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';

const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTESoftCornerIcon = (props) => {
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
      <path d="M21 0L3 0C1.34315 0 0 1.34315 0 3V11C0 12.6569 1.34315 14 3 14H21V13H3C1.89543 13 1 12.1046 1 11V3C1 1.89543 1.89543 1 3 1H21V0Z" />
    </SvgIcon>
  );
};
