import React from "react";

const EditIcon = (props: React.SVGAttributes<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      {...props}
    >
      <path
        d="M13.8233 5.07346L10.9028 2.17681L12.0311 1.04746C12.2851 0.793163 12.5941 0.666016 12.958 0.666016C13.3219 0.666016 13.6309 0.793163 13.8849 1.04746L14.9383 2.10184C15.1924 2.35613 15.3239 2.66096 15.3327 3.01631C15.3416 3.37166 15.219 3.67648 14.9649 3.93077L13.8233 5.07346ZM12.8848 6.02624L3.58705 15.3327H0.666504V12.4094L9.9642 3.10292L12.8848 6.02624Z"
        fill="#607D8B"
      />
    </svg>
  );
};

export default EditIcon;
