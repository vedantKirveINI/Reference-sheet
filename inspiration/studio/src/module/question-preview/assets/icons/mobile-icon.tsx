import React from "react";
import type { SVGProps } from "react";

const MobileIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="14"
      height="22"
      viewBox="0 0 14 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.3077 21.3125C1.80257 21.3125 1.375 21.1375 1.025 20.7875C0.675 20.4375 0.5 20.0099 0.5 19.5047V2.1202C0.5 1.61507 0.675 1.1875 1.025 0.8375C1.375 0.4875 1.80257 0.3125 2.3077 0.3125H11.6922C12.1974 0.3125 12.625 0.4875 12.975 0.8375C13.325 1.1875 13.5 1.61507 13.5 2.1202V19.5047C13.5 20.0099 13.325 20.4375 12.975 20.7875C12.625 21.1375 12.1974 21.3125 11.6922 21.3125H2.3077ZM1.99997 17.0625H12V4.56245H1.99997V17.0625Z"
        fill="black"
      />
    </svg>
  );
};

export default MobileIcon;
