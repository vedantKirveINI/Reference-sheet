import React from "react";
import type { SVGProps } from "react";

const FillBigIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="96"
      height="61"
      viewBox="0 0 96 61"
      fill="none"
      {...props}
    >
      <g clipPath="url(#clip0_4029_29398)">
        <path
          d="M4.34043 1.42969H91.6596C93.4924 1.42969 95 2.93822 95 4.82624V56.0331C95 57.9212 93.4924 59.4297 91.6596 59.4297H4.34043C2.50763 59.4297 1 57.9212 1 56.0331V4.82624C1 2.93822 2.50763 1.42969 4.34043 1.42969Z"
          fill="white"
          stroke="#C7C7C7"
          strokeWidth="2"
        />
        <path
          d="M35.25 43.1796V34.9297H37.5V39.3489L42.525 34.3239L44.1057 35.9046L39.0807 40.9297H43.5V43.1796H35.25ZM53.4749 26.5354L51.8942 24.9547L56.9192 19.9297H52.5V17.6797H60.7499V25.9297H58.5V21.5104L53.4749 26.5354Z"
          fill="black"
          fillOpacity="0.2"
        />
      </g>
      <defs>
        <clipPath id="clip0_4029_29398">
          <rect
            width="96"
            height="60"
            fill="white"
            transform="translate(0 0.429688)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FillBigIcon;
