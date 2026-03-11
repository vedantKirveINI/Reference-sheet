import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const TwitterIcon = (props) => {
  return (
    <SvgIcon
      viewBox={"0 0 41 37"}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        ...props.sx,
      }}
    >
      <path
        d="M27.1995 7.27344H30.9314L22.7781 16.5926L32.3701 29.2734H24.8594L18.9771 21.5824L12.2463 29.2734H8.5118L17.2327 19.3058L8.03125 7.27344H15.7322L21.0495 14.3032L27.1995 7.27344ZM25.8896 27.0395H27.9576L14.6086 9.39011H12.3896L25.8896 27.0395Z"
        fill={props?.sx?.color || "#90a4ae"}
      />
    </SvgIcon>
  );
};
