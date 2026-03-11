import React from "react";
import type { SVGProps } from "react";

const FillIcon = (props: SVGProps<SVGSVGElement>) => {
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
        d="M3.5 20.5V15H4.99997V17.9461L8.35 14.5961L9.40383 15.65L6.0538 19H8.99998V20.5H3.5ZM15.65 9.40383L14.5961 8.35L17.9461 4.99997H15V3.5H20.5V8.99998H19V6.0538L15.65 9.40383Z"
        fill="#263238"
      />
    </svg>
  );
};

export default FillIcon;
