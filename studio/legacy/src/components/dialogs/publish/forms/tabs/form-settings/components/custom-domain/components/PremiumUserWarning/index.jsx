// import ODSButton from "oute-ds-button";
import classes from "./index.module.css";
// import { serverConfig } from "oute-ds-utils";
import { ODSButton, serverConfig } from "@src/module/ods";
import { REDIRECT_PATHS } from "../../../../../../../../../../pages/ic-canvas/constants/constants";
import InfoLabel from "../../../remove-branding/info-label";

const PremiumUserWarning = () => {
  const handleUpgradeClick = () => {
    const baseUrl = serverConfig.WC_LANDING_URL || "";
    window.open(
      `${baseUrl}/${REDIRECT_PATHS.SETTINGS}/${REDIRECT_PATHS.PLANS_AND_BILLING}`,
      "_blank",
    );
  };

  return (
    <div className={classes.warningContainer}>
      <InfoLabel message="Upgrade plan to use custom domain" />

      <ODSButton
        variant="black"
        size="large"
        onClick={handleUpgradeClick}
        startIcon={
          <img
            src="https://cdn-v1.tinycommand.com/1234567890/1758549240735/Diamond.svg"
            alt="premium-icon"
            style={{
              width: "1rem",
              height: "1rem",
            }}
          />
        }
        sx={{
          marginLeft: "auto",
        }}
        data-testid="custom-domain-upgrade-button"
      >
        UPGRADE PLAN
      </ODSButton>
    </div>
  );
};

export default PremiumUserWarning;
