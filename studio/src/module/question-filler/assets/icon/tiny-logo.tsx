import type { SVGProps } from "react";

const TinyLogo = (props: SVGProps<SVGSVGElement>) => {
  const fillColor = props?.fill;
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17.25 4.20863V8.25H11.3968L11.3655 8.22666L8.2066 5.92786L7.0717 5.09936L6.75 4.86598V0H11.3968V4.20863H17.25Z"
        fill={fillColor || "white"}
      />
      <path
        d="M15.9683 20.0504C15.5235 20.123 15.061 20.1592 14.5677 20.1592C13.5019 20.1592 12.6915 19.9094 12.1365 19.4096C11.5772 18.9139 11.2997 18.1441 11.2997 17.1003V8.27418H6.75V17.7411C6.75 19.8247 7.34899 21.3925 8.53817 22.4363C9.73175 23.4801 11.379 24 13.4799 24C14.255 24 14.9421 23.9718 15.5367 23.9113C16.1357 23.8549 16.7039 23.7542 17.25 23.6091V19.8046C16.836 19.8973 16.4088 19.9819 15.9683 20.0504ZM11.2997 8.25V8.27418H11.3305L11.2997 8.25Z"
        fill={fillColor || "white"}
      />
    </svg>
  );
};

export default TinyLogo;
