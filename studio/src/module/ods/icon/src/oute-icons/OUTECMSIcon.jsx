import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTECMSIcon = (props) => {
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
        fill={background || "#EA59ED"}
      />
      <path
        d="M6.72039 7.875H17.25"
        stroke={color || "white"}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M6.72046 16.0559L6.72046 7.99341"
        stroke={color || "white"}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
      <path
        d="M6.72039 16.125H17.25"
        stroke={color || "white"}
        strokeWidth="1.89474"
        strokeLinecap="round"
      />
    </IconBase>
  );
};
