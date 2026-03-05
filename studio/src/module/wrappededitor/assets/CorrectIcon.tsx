import type { SVGProps } from "react";

const CorrectIcon = (props: SVGProps<SVGSVGElement>) => {
  const fillColor = props?.fill;
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
        d="M9.54999 17.6538L4.21539 12.3192L5.28462 11.25L9.54999 15.5154L18.7154 6.34998L19.7846 7.41918L9.54999 17.6538Z"
        fill={fillColor || "white"}
      />
    </svg>
  );
};

export default CorrectIcon;
