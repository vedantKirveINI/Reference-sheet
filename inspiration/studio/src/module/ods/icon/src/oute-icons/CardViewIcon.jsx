import React from "react";
import IconBase from "../IconBase.jsx";
export const CardViewIcon = (props) => {
  return (
    <IconBase
      viewBox={"0 0 63 18"}
      {...props}
      width={24} height={24}
    >
      <rect
        x="0.474609"
        y="0.949219"
        width="61.9809"
        height="3.93162"
        rx="1.96581"
        fill={props.color || "#90a4ae"}
      />
      <rect
        x="0.474609"
        y="7.24023"
        width="42.4615"
        height="2.35897"
        rx="1.17949"
        fill={props.color || "#90a4ae"}
      />
      <rect
        x="0.474609"
        y="12.7441"
        width="9.4359"
        height="4.71795"
        rx="0.786325"
        fill={props.color || "#90a4ae"}
      />
    </IconBase>
  );
};
