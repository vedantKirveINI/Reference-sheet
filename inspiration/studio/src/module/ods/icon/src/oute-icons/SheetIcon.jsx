import React from "react";
import IconBase from "../IconBase.jsx";
export const SheetIcon = (props) => {
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24} height={24} color="#90a4ae"
    >
      <path
        d="M9.08255 9.54817H3V3.58594H10.0495L10.3926 4.00035L11.6136 5.45749L15.0002 9.50807L15.0359 9.54817V20.4166H9.07809V9.54817H9.08255Z"
        fill={props.color || "#90a4ae"}
      />
      <path
        d="M21.0007 3.58594H15.043V9.54372H21.0007V3.58594Z"
        fill={props.color || "#90a4ae"}
      />
    </IconBase>
  );
};
