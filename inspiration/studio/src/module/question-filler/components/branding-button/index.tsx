import React from "react";
import { containerStyles } from "./syles";
import { BrandComponent } from "./components/BrandComponent";
interface BrandingButtonProps {
  theme?: any;
  viewPort?: any;
}

const BrandingButton: React.FC<BrandingButtonProps> = ({
  theme = {},
  viewPort,
}) => {
  return (
    <a
      href={`${process.env.REACT_APP_TINYCOMMAND_URL}/`}
      target="_blank"
      tabIndex={2}
      style={containerStyles({ theme, viewPort })}
      data-testid="tiny-brand-logo"
    >
      <BrandComponent viewPort={viewPort} theme={theme} />
    </a>
  );
};

export default BrandingButton;
