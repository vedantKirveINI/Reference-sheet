import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTEContentIcon = (props) => {
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
        fill={`${background || "#4796EC"}`}
      />
      <path
        d="M6.1579 9.63159H18"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M6.15789 14.2104H14.6842"
        stroke={`${color || "white"}`}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
    </IconBase>
  );
};
