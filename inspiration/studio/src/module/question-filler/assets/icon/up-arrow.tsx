import React from "react";
import type { SVGProps } from "react";

const UpArrow = (props: SVGProps<SVGSVGElement>) => {
  const fillColor = props?.fill;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 6.25L3.75 12.5L4.625 13.375L10 8L15.375 13.375L16.25 12.5L10 6.25Z"
        fill={fillColor || "#607D8B"}
      />
    </svg>
  );
};

export default UpArrow;
