import React, { useCallback } from "react";

const Play = ({ isCurrentTool = true, currentToolHandler = () => {} }) => {
  const clickHandler = useCallback(() => {
    currentToolHandler("play");
  }, [currentToolHandler]);
  return (
    <div style={{ cursor: "pointer" }} onClick={clickHandler}>
      <svg 
        width="10" 
        height="12" 
        viewBox="0 0 10 12" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M1.88077 11.2172C1.57949 11.4146 1.27404 11.4255 0.964425 11.2499C0.654808 11.0743 0.5 10.8057 0.5 10.4441V1.55578C0.5 1.19425 0.654808 0.925654 0.964425 0.750004C1.27404 0.574371 1.57949 0.585271 1.88077 0.782704L8.87685 5.2365C9.1512 5.41727 9.28837 5.67175 9.28837 5.99995C9.28837 6.32815 9.1512 6.58264 8.87685 6.7634L1.88077 11.2172Z" 
          fill="#2196F3"
        />
      </svg>
    </div>
  );
};

export default Play;
