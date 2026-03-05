import React, { useCallback } from "react";
// import { ODSIcon as Icon } from '@src/module/ods';
// import { ODSLabel as Label } from '@src/module/ods';
import { ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
const DiagramScale = ({
  maxScale = 250,
  minScale = 25,
  scaleStep = 25,
  scale = 100,
  onScaleChange = () => {},
}) => {
  const handleZoomIn = useCallback(() => {
    let newScale = Math.min(parseFloat(scale) + scaleStep, maxScale);
    //take user to nearest scale step eg. if scale is at 120, clicking this shud take user to 125 and not 150
    if (newScale % scaleStep !== 0) {
      newScale = Math.ceil(newScale / scaleStep) * scaleStep;
    }

    onScaleChange(newScale);
  }, [maxScale, onScaleChange, scale, scaleStep]);

  const handleZoomOut = useCallback(() => {
    let newScale = Math.max(parseFloat(scale) - scaleStep, minScale);

    //take user to nearest scale step eg. if scale is at 116, clicking this shud take user to 100 and not 75
    if (newScale % scaleStep !== 0) {
      newScale = Math.floor(newScale / scaleStep) * scaleStep;
    }
    onScaleChange(newScale);
  }, [minScale, onScaleChange, scale, scaleStep]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        border: "0.75px solid #CFD8DC",
        borderRadius: "0.375rem",
      }}
    >
      <Icon
        key="zoom-in"
        outeIconName="ZoomInIcon"
        outeIconProps={{
          sx: { width: "2.25rem", height: "2.25rem", color: "#212121" },
        }}
        onClick={handleZoomIn}
      />
      {/* vertical divider */}
      <div
        style={{
          width: "1px",
          height: "2.5rem",
          background: "#CFD8DC",
          margin: "0 0.5rem",
        }}
      />
      <Label key="scale">{`${scale} %`}</Label>
      {/* vertical divider */}
      <div
        style={{
          width: "1px",
          height: "2.5rem",
          background: "#CFD8DC",
          margin: "0 0.5rem",
        }}
      />
      <Icon
        key="zoom-out"
        outeIconName="ZoomOutIcon"
        outeIconProps={{
          sx: { width: "2.25rem", height: "2.25rem", color: "#212121" },
        }}
        onClick={handleZoomOut}
      />
    </div>
  );
};

export default DiagramScale;
