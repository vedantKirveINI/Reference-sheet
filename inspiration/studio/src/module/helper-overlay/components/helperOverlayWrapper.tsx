import { ReactNode } from "react";
import { getHelperStyle, getImgStyle, getWrapperStyle } from "./style";
export type HelperOverlayWrapperProps = {
  showOverlay?: boolean;
  helperText?: string;
  direction?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  style: React.CSSProperties;
};
import horizontalLine from "../assets/horizontalLine.svg";
import verticalLine from "../assets/verticalLine.svg";

export const HelperOverlayWrapper = ({
  showOverlay,
  helperText = "",
  direction = "top",
  style = {},
  children,
}: HelperOverlayWrapperProps) => {
  if (!showOverlay) return children;

  const getImg = (direction) => {
    if (direction === "left" || direction === "right") {
      return horizontalLine;
    }
    return verticalLine;
  };

  return (
    <div style={getWrapperStyle()}>
      {children}
      <div
        style={{
          ...getHelperStyle({ direction }),
          ...style,
        }}
      >
        <div>{helperText}</div>
        <img src={getImg(direction)} style={getImgStyle({ direction })} />
      </div>
    </div>
  );
};
