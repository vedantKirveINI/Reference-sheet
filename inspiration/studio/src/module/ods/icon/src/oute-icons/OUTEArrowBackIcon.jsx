import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTEArrowBackIcon = (props) => {
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24} height={24} color="#90a4ae"
    >
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </IconBase>
  );
};
