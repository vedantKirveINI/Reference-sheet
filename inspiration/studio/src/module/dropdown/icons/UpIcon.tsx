import * as React from "react";
import { SVGProps } from "react";
const UpIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
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
        d="M12 7.5L19.5 15L18.45 16.05L12 9.6L5.55 16.05L4.5 15L12 7.5Z"
        fill="#010E50"
      />
    </svg>
  );
};

export default UpIcon;
