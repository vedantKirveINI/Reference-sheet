import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const OUTEMobileIcon = (props) => {
  return (
    <SvgIcon
      viewBox={`0 0 24 24`}
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        fill: "#263238",
        ...props.sx,
      }}
    >
      <path d="M7.3077 22.5C6.80257 22.5 6.375 22.325 6.025 21.975C5.675 21.625 5.5 21.1974 5.5 20.6922V3.3077C5.5 2.80257 5.675 2.375 6.025 2.025C6.375 1.675 6.80257 1.5 7.3077 1.5H16.6922C17.1974 1.5 17.625 1.675 17.975 2.025C18.325 2.375 18.5 2.80257 18.5 3.3077V20.6922C18.5 21.1974 18.325 21.625 17.975 21.975C17.625 22.325 17.1974 22.5 16.6922 22.5H7.3077ZM6.99997 18.25H17V5.74995H6.99997V18.25Z" />
    </SvgIcon>
  );
};
