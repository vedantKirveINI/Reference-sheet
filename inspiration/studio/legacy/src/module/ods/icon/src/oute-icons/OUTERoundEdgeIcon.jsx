import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';

const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTERoundEdgeIcon = (props) => {
  return (
    <SvgIcon
      viewBox="0 0 19 14"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#000",
        ...props.sx,
      }}
    >
      <path d="M19 0H7C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14H19V13H7C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1H19V0Z" />
    </SvgIcon>
  );
};
