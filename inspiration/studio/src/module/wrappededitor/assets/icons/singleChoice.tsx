import type { SVGProps } from "react";

const SingleChoice = (props: SVGProps<SVGSVGElement>) => {
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
      <rect width="20" height="20" rx="10" fill={fillColor || "#2196F3"} />
      <path
        d="M7.95832 14.7115L3.51282 10.266L4.40384 9.37496L7.95832 12.9294L15.5961 5.29163L16.4871 6.18263L7.95832 14.7115Z"
        fill={fillColor || "#2196F3"}
      />
    </svg>
  );
};

export default SingleChoice;
