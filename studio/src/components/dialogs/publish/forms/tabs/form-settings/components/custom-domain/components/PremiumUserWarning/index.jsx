import classes from "./index.module.css";
import { serverConfig } from "@src/module/ods";
import { Button } from "@/components/ui/button";

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
      <div className={classes.infoLabelWrapper}>
        <InfoLabel message="Upgrade plan to use custom domain" />
      </div>

      <Button
        variant="black"
        onClick={handleUpgradeClick}
        className={classes.upgradeButton}
        data-testid="custom-domain-upgrade-button"
      >
        <img
          src="https://cdn-v1.tinycommand.com/1234567890/1758549240735/Diamond.svg"
          alt="premium-icon"
          className={classes.diamondIcon}
        />
        <span className={classes.buttonText}>UPGRADE PLAN</span>
      </Button>
    </div>
  );
};

export default PremiumUserWarning;
