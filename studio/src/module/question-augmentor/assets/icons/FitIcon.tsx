import React from "react";
import type { SVGProps } from "react";

const FitIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      {...props}
    >
      <path
        d="M11.8438 0.941936L11.8438 6.44191L17.3437 6.44191L17.3437 4.94194L14.3975 4.94194L17.7476 1.59191L16.6937 0.538086L13.3437 3.88811L13.3437 0.941936L11.8438 0.941936Z"
        fill="black"
      />
      <path
        d="M1.16166 11.6123L6.66164 11.6123L6.66164 17.1123L5.16166 17.1123L5.16166 14.1661L1.81164 17.5161L0.757813 16.4623L4.10784 13.1123L1.16166 13.1123L1.16166 11.6123Z"
        fill="black"
      />
    </svg>
  );
};

export default FitIcon;
