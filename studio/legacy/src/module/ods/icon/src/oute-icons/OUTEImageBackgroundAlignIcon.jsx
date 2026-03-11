import React from "react";
import SvgIcon from "@mui/material/SvgIcon";
import { DEFAULT_STYLE } from '../constant.jsx';

const DEFAULT_WIDTH = DEFAULT_STYLE.DEFAULT_WIDTH;
const DEFAULT_HEIGHT = DEFAULT_STYLE.DEFAULT_HEIGHT;

export const OUTEImageBackgroundAlignIcon = (props) => {
  return (
    <SvgIcon
      viewBox="0 0 30 10"
      {...props}
      sx={{
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
        color: "#90a4ae",
        ...props.sx,
      }}
    >
      <g id="Group 289426">
        <path
          id="Vector"
          d="M0.833984 0.937663C0.833984 0.604002 1.10448 0.333496 1.43815 0.333496H29.2298C29.5635 0.333496 29.834 0.604002 29.834 0.937663C29.834 1.27132 29.5635 1.54183 29.2298 1.54183H1.43815C1.10447 1.54183 0.833984 1.27132 0.833984 0.937663Z"
          fill={props.sx.color || "#90a4ae"}
        />
        <path
          id="Vector_2"
          d="M0.833984 9.39591C0.833984 9.06225 1.10448 8.79175 1.43815 8.79175H19.5632C19.8968 8.79175 20.1673 9.06225 20.1673 9.39591C20.1673 9.72958 19.8968 10.0001 19.5632 10.0001H1.43815C1.10448 10.0001 0.833984 9.72958 0.833984 9.39591Z"
          fill={props.sx.color || "#90a4ae"}
        />
      </g>
    </SvgIcon>
  );
};
