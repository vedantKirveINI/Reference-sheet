import React from "react";
import IconBase from "../IconBase.jsx";
export const WCWorkflowIcon = (props) => {
  const { color, background, ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
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
        fill={`${background || "#358CFF"}`}
      />
      <path
        d="M15.6169 15.7689V19.6681H9.12834L4.0695 15.7689L4 15.7153V10.5312H9.12834V15.7689H15.6169Z"
        fill={`${color || "white"}`}
      />
      <path
        d="M7.53149 8.89909L7.53149 4.99988L14.0201 4.99988L19.0789 8.8991L19.1484 8.95263L19.1484 14.1367L14.0201 14.1367L14.0201 8.8991L7.53149 8.89909Z"
        fill={`${color || "white"}`}
      />
    </IconBase>
  );
};
