import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTEPauseIcon = (props) => {
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24} height={24} color="#90a4ae"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </IconBase>
  );
};
