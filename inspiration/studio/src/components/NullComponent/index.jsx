import Lottie from "lottie-react";
// import { ODSLabel } from '@src/module/ods';
import { ODSLabel } from "@src/module/ods";
import doubleClickLottie from "../../assets/lotties/double-click.json";

const NullComponent = ({ nodeCount }) => {
  if (nodeCount > 0) return null;

  return (
    <div className="fixed inset-0 left-0 bottom-24 z-10 flex flex-col items-center justify-center pointer-events-none w-screen h-screen">
      <Lottie
        animationData={doubleClickLottie}
        loop={true}
        className="flex items-center justify-center w-80"
      />
      <ODSLabel variant="h6">Double-click on the canvas to add a node</ODSLabel>
    </div>
  );
};

export default NullComponent;
