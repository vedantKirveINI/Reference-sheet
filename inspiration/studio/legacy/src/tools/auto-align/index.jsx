import React, { useCallback } from "react";

const AutoAlign = ({ isCurrentTool = true, currentToolHandler = () => {} }) => {
  const clickHandler = useCallback(() => {
    currentToolHandler("auto-align");
  }, [currentToolHandler]);
  return (
    <div style={{ cursor: "pointer" }} onClick={clickHandler}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1904_24452)">
          <path
            d="M25.7373 21.0008L10.5 5.76342C10.1667 5.44516 9.72353 5.26758 9.26268 5.26758C8.80183 5.26758 8.3587 5.44516 8.02539 5.76342L5.76264 8.02617C5.43499 8.35459 5.25098 8.79956 5.25098 9.26347C5.25098 9.72738 5.43499 10.1723 5.76264 10.5008L20.9991 25.7381C21.3275 26.0657 21.7725 26.2497 22.2364 26.2497C22.7003 26.2497 23.1452 26.0657 23.4737 25.7381L25.7373 23.4749C25.8998 23.3125 26.0288 23.1196 26.1167 22.9073C26.2047 22.695 26.25 22.4674 26.25 22.2376C26.25 22.0078 26.2047 21.7803 26.1167 21.568C26.0288 21.3557 25.8998 21.1628 25.7373 21.0003V21.0008ZM6.99997 9.26342L9.26264 7.00076L13.6376 11.3758L11.3744 13.6393L6.99936 9.2643L6.99997 9.26342ZM22.2364 24.5008L12.6114 14.8766L14.875 12.6131L24.5 22.2381L22.2364 24.5008Z"
            fill={isCurrentTool ? "#3A4EFF" : "#6A81A3"}
          />
          <path
            d="M3.49998 12.25L1.75 14L3.49998 15.75L5.24997 14L3.49998 12.25Z"
            fill={isCurrentTool ? "#3A4EFF" : "#6A81A3"}
          />
          <path
            d="M14 1.75002L12.25 3.5L14 5.24998L15.75 3.5L14 1.75002Z"
            fill={isCurrentTool ? "#3A4EFF" : "#6A81A3"}
          />
          <path
            d="M3.49998 1.75002L1.75 3.5L3.49998 5.24998L5.24997 3.5L3.49998 1.75002Z"
            fill={isCurrentTool ? "#3A4EFF" : "#6A81A3"}
          />
        </g>
        <defs>
          <clipPath id="clip0_1904_24452">
            <rect width="28" height="28" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
};

export default AutoAlign;
