import React from "react";
import type { SVGProps } from "react";

const LineIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="2"
      height="27"
      viewBox="0 0 2 27"
      fill="none"
      {...props}
    >
      <path d="M1 0.429688V26.4297" stroke="#CFD8DC" />
    </svg>
  );
};

export default LineIcon;
