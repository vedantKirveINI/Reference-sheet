import { ViewPort } from "../../module/constants";
import classes from "./index.module.css";
// import Icon from "oute-ds-icon";
import { ODSIcon as Icon } from "@src/module/ods";
import { useCallback, useState } from "react";

const RemoveBranding = ({ onClick, viewPort }) => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = viewPort === ViewPort.MOBILE;

  const handleClose = useCallback(() => setIsVisible(false), []);

  if (!isVisible) return null;

  return (
    <div
      className={`${classes["container"]} ${
        isMobile ? classes["mobile-container"] : ""
      }`}
    >
      <img
        className={classes["color-palette"]}
        src={
          "https://cdn-v1.tinycommand.com/1234567890/1758548136081/RemoveBrandingLogo.svg"
        }
        alt="remove-branding-logo"
      />
      <div
        className={classes["content-container"]}
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          gap: "0.5rem",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
        }}
      >
        <div className={classes["content"]}>
          <h3>Remove default branding in one click.</h3>
          <p>Deliver a clean, unbranded experience to users.</p>
        </div>
        <div
          className={classes["button"]}
          onClick={() => {
            onClick();
            handleClose();
          }}
        >
          REMOVE BRANDING
        </div>
      </div>
      <Icon
        onClick={handleClose}
        outeIconName="OUTECloseIcon"
        outeIconProps={{ sx: { color: "white" } }}
        buttonProps={{ sx: { padding: "0 0 0 0.5rem" } }}
      />
    </div>
  );
};

export default RemoveBranding;
