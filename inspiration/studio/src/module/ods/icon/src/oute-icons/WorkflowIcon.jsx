import React from "react";
import IconBase from "../IconBase.jsx";
export const WorkflowIcon = (props) => {
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24} height={24} color="#90a4ae"
    >
      <path
        d="M17.796 16.2103V20.9964H10.0816L4.067 16.2103L3.98438 16.1446V9.78125H10.0816V16.2103H17.796Z"
        fill={props.color || "#90a4ae"}
      />
      <path
        d="M8.17285 7.78617V3H15.8873L21.9018 7.78617L21.9845 7.85188V14.2151H15.8873V7.78617H8.17285Z"
        fill={props.color || "#90a4ae"}
      />
    </IconBase>
  );
};
