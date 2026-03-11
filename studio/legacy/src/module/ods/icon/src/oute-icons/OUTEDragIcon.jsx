import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';
const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTEDragIcon = (props) => {
  return (
    <SvgIcon
      viewBox="0 -960 960 960"
      data-testid="OUTEDragIcon"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props.sx,
      }}
    >
      <path d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z" />
    </SvgIcon>
  );
};
