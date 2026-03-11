import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
// import ODSCircularProgress from "oute-ds-circular-progress";
// import Label from "oute-ds-label";
import { ODSLabel as Label } from "@src/module/ods";
// import Icon from "oute-ds-icon";
// import logo from "../../assets/images/logo.gif";

import Lottie from "lottie-react";
import animationData from "../../assets/lotties/tinycommand-loading.json";

const PageProcessingLoader = ({
  message = "",
  style = {},
  height = "2rem",
}) => {
  const lottieRef = useRef();
  const keydownHandler = (e) => e.preventDefault();
  useEffect(() => {
    document.addEventListener("keydown", keydownHandler, false);
    return () => {
      document.removeEventListener("keydown", keydownHandler, false);
    };
  }, []);
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.setSpeed(2); // This will set the animation speed to 2x
    }
  }, []);
  const content = (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none !important",
        background: "rgba(38, 50, 56, 0.2)",
        cursor: "default",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          position: "fixed",
          top: "6rem",
          alignItems: "center",
          gap: "12px",
          background: "#fff",
          borderRadius: "8px",
          padding: "12px",
          boxSizing: "border-box",
          fontSize: "1rem",
          boxShadow: "0px 8px 20px 0px rgba(122, 124, 141, 0.2)",
          ...style,
        }}
        data-testid="page-processing-loader"
      >
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ height }}
          lottieRef={lottieRef}
        />
        {message && <Label variant="subtitle1">{message}</Label>}
      </div>
    </div>
  );
  return createPortal(content, document.getElementById("root"));
};

export default PageProcessingLoader;
