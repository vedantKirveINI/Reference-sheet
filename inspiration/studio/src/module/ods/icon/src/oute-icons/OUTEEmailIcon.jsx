import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTEEmailIcon = (props) => {
  const { background, color, ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24} height={24} {...rest}
    >
      <rect
        width="24"
        height="24"
        rx="7.57895"
        fill={`${background || "#ED5F59"}`}
      />
      <path
        d="M19.1053 7.10521L12 12.4736"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M4.89474 7.10521L12 12.4736"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
    </IconBase>
  );
};
