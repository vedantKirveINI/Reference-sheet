import React from "react";
import IconBase from "../IconBase.jsx";
export const WCSheetIcon = (props) => {
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
        fill={`${background || "#369B7D"}`}
      />
      <path
        d="M9.87479 20.5544H15.0007V10.1626L9.87479 4.0869L9.80369 4H3V10.1626H9.87479V20.5544Z"
        fill={`${color || "white"}`}
      />
      <path d="M21.0003 4H15V10.1119H21.0003V4Z" fill={`${color || "white"}`} />
    </IconBase>
  );
};
