import React from "react";
import type { SVGProps } from "react";

const ChevronLeft = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_2034_36714)">
        <path
          d="M8.85039 12.1484L14.1004 17.3984L15.1504 16.3484L10.9504 12.1484L15.1504 7.94844L14.1004 6.89844L8.85039 12.1484Z"
          fill="#6A81A3"
        />
      </g>
      <defs>
        <clipPath id="clip0_2034_36714">
          <rect
            width="24"
            height="24"
            fill="white"
            transform="matrix(-1 0 0 1 24 0)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ChevronLeft;
