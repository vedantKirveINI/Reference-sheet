import React from "react";
import IconBase from "../IconBase.jsx";
export const OUTEWorkflowIcon = (props) => {
  const { background, color, ...rest } = props.sx || {}; // Destructure background and color, and collect the rest of the properties
  return (
    <IconBase
      viewBox={`0 0 24 24`}
      {...props}
      width={24} height={24} {...rest}
    >
      <path
        d="M21.2283 0H2.78635C1.24749 0 0 1.24673 0 2.78465V21.2153C0 22.7533 1.24749 24 2.78635 24H21.2283C22.7671 24 24.0146 22.7533 24.0146 21.2153V2.78465C24.0146 1.24673 22.7671 0 21.2283 0Z"
        fill={`${background || "url(#paint0_linear_18378_61510)"}`}
      />
      <path
        d="M10.1385 13.4678H6.625V9.04183L6.64381 9.01677L8.64346 6.62993L9.36433 5.77167L9.56806 5.52734H13.7962V9.0387H10.1385V13.4647V13.4678Z"
        fill={`${color || "white"}`}
      />
      <path
        d="M13.8686 9.87109H17.3821V14.2971L17.3633 14.3222L15.3636 16.709L14.6428 17.5673L14.439 17.8116H10.2109V14.3002H13.8686V9.87423V9.87109Z"
        fill={`${color || "white"}`}
      />
      <defs>
        <linearGradient
          id="paint0_linear_18378_61510"
          x1="33.6775"
          y1="-8.60141"
          x2="1.04065"
          y2="22.4631"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#358CFF" />
          <stop offset="0.16" stopColor="#3385F6" />
          <stop offset="0.41" stopColor="#2D73DF" />
          <stop offset="0.72" stopColor="#2555BA" />
          <stop offset="1" stopColor="#1C3693" />
        </linearGradient>
      </defs>
    </IconBase>
  );
};
