import React from "react";
import { ODSCircularProgress as CircularProgress } from "@src/module/ods";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Logging you in....",
}) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.5rem",
        }}
      >
        <CircularProgress size={48} />
        <div
          style={{
            fontSize: "1rem",
            color: "#212121",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
