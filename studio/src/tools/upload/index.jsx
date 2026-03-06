import React, { useCallback } from "react";

const Upload = ({ isCurrentTool = true, currentToolHandler = () => {} }) => {
  const clickHandler = useCallback(() => {
    currentToolHandler("upload");
  }, [currentToolHandler]);
  return (
    <div style={{ cursor: "pointer" }} onClick={clickHandler}>
      <svg 
        width="16" 
        height="16" 
        viewBox="0 0 16 16" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M2.3077 15.4999C1.80257 15.4999 1.375 15.3249 1.025 14.9749C0.675 14.6249 0.5 14.1974 0.5 13.6922V11H1.99997V13.6922C1.99997 13.7692 2.03202 13.8397 2.09612 13.9038C2.16024 13.9679 2.23077 14 2.3077 14H13.6922C13.7692 14 13.8397 13.9679 13.9038 13.9038C13.9679 13.8397 14 13.7692 14 13.6922V11H15.5V13.6922C15.5 14.1974 15.325 14.6249 14.975 14.9749C14.625 15.3249 14.1974 15.4999 13.6922 15.4999H2.3077ZM7.25 11.6153V3.2153L4.78462 5.68068L3.7308 4.59608L7.99997 0.326904L12.2692 4.59608L11.2153 5.68068L8.74995 3.2153V11.6153H7.25Z" 
          fill="white"
        />
      </svg>
    </div>
  );
};

export default Upload;
