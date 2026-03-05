import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTEFolderIcon = (props) => {
  const { background, color } = props || {};
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24}
      height={24}
      color={props.color || "#fb8c00"}
    >
      <rect
        width="24"
        height="24"
        rx="7.58"
        fill={`${background || "#EDB259"}`}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 6.9375C4 6.41973 4.41973 6 4.9375 6H10C10.2486 6 10.4871 6.09877 10.6629 6.27459L12.0758 7.6875H19C19.5178 7.6875 19.9375 8.10723 19.9375 8.625V17.625C19.9375 18.1428 19.5178 18.5625 19 18.5625H4.9375C4.41973 18.5625 4 18.1428 4 17.625V6.9375ZM5.875 7.875V16.6875H18.0625V9.5625H11.6875C11.4389 9.5625 11.2004 9.46373 11.0246 9.28791L9.61167 7.875H5.875Z"
        fill={`${color || "white"}`}
      />
    </IconBase>
  );
};
