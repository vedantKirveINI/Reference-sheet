import * as React from "react";
import { SVGProps } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 16.5L4.5 8.99995L5.55 7.94995L12 14.4L18.45 7.94995L19.5 8.99995L12 16.5Z"
      fill={props?.style?.color || "#010E50"}
    />
  </svg>
);
export default SvgComponent;
