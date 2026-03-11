import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;
export const SendIcon = (props) => {
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
      <path d="M5.694 12 2.299 3.273c-.236-.607.356-1.188.942-.981l.093.039 18 9a.75.75 0 0 1 .097 1.284l-.097.057-18 9c-.583.292-1.217-.244-1.065-.847l.03-.095L5.694 12 2.299 3.272l3.395 8.729ZM4.402 4.542l2.61 6.709h6.627a.75.75 0 0 1 .743.649l.007.102a.75.75 0 0 1-.649.743l-.101.007-6.628-.001-2.609 6.71L19.322 12 4.401 4.542Z" />
    </SvgIcon>
  );
};
