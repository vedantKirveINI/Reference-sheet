import Lottie from "lottie-react";
// import ODSLabel from "oute-ds-label";
import { ODSLabel } from "@src/module/ods";
import doubleClickLottie from "../../assets/lotties/double-click.json";

const NullComponent = ({ nodeCount }) => {
  if (nodeCount > 0) return null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        zIndex: 999,
        left: 0,
        bottom: "6rem",
      }}
    >
      <Lottie
        animationData={doubleClickLottie}
        loop={true}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "20rem",
        }}
      />
      <ODSLabel variant="h6">Double-click on the canvas to add a node</ODSLabel>
    </div>
  );
};

export default NullComponent;
