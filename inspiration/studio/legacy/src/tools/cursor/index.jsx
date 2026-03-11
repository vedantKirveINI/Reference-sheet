import React, { useCallback } from "react";

const Cursor = ({ isCurrentTool = true, currentToolHandler = () => {} }) => {
  const clickHandler = useCallback(() => {
    currentToolHandler("cursor");
  }, [currentToolHandler]);
  return (
    <div style={{ cursor: "pointer" }} onClick={clickHandler}>
        <svg 
        width="10.89" 
        height="16.99" 
        viewBox="0 0 12 18" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path 
        d="M8.76519 17.5577C8.44597 17.7089 8.12674 17.725 7.80751 17.6057C7.48829 17.4865 7.25304 17.2673 7.10176 16.9481L4.14021 10.5846L2.00753 13.5557C1.74985 13.9173 1.41172 14.031 0.993134 13.8971C0.574534 13.7631 0.365234 13.4769 0.365234 13.0384V1.60775C0.365234 1.22955 0.53511 0.958401 0.87486 0.794301C1.21459 0.630201 1.5351 0.66546 1.83638 0.900076L10.8882 8.02308C11.2331 8.28719 11.3328 8.62181 11.1873 9.02693C11.0418 9.43206 10.753 9.63463 10.3209 9.63463H6.44788L9.37481 15.8942C9.52608 16.2134 9.5421 16.5327 9.42288 16.8519C9.30365 17.1711 9.08442 17.4064 8.76519 17.5577Z" 
        fill={isCurrentTool ? "#2196F3" : "#6A81A3"}
        />
        </svg>
    </div>
  );
};

export default Cursor;
