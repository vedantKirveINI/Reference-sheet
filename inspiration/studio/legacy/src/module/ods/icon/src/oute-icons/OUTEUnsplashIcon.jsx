import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';

const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTEUnsplashIcon = (props) => {
  return (
    <SvgIcon
      viewBox="0 0 24 24"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props.sx,
      }}
    >
      <path d="M16.5 17.25h-9v-6.75h-7.5v13.5h24v-13.5h-7.5zM7.5 0h9v6.75h-9z" />
    </SvgIcon>
  );
};
