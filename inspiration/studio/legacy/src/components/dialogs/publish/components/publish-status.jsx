import Lottie from "lottie-react";
import pendingLottie from "../../../../assets/lotties/idle.json";
import successLottie from "../../../../assets/lotties/publish-success.json";
import failedLottie from "../../../../assets/lotties/publish-failure.json";
import classes from "./publish-status.module.css";
// import AdvancedLabel from "oute-ds-advanced-label";
// import Icon from "oute-ds-icon";
import { ODSAdvancedLabel as AdvancedLabel, ODSIcon as Icon } from "@src/module/ods";
import { FAILED, PENDING, SUCCESS } from "../../../../constants/keys";
import { getMode } from "../../../canvas/config";
import { CANVAS_MODES } from "../../../../module/constants";

const getLottieAnimation = ({
  animationData,
  loop,
  onComplete = () => {},
  status,
}) => {
  return (
    <Lottie
      style={{ height: "250px" }}
      animationData={animationData}
      loop={loop}
      onComplete={onComplete}
      data-testid={`publish-status-${status.toLowerCase()}-animation`}
    />
  );
};

export const PublishStatus = ({
  publishStatus,
  setPublishStatus,
  closeHandler = () => {},
}) => {
  return (
    <div
      className={classes["publish-status-container"]}
      data-testid="publish-status-container"
    >
      <div
        className={classes["publish-status-lottie"]}
        data-testid="publish-status-lottie-container"
      >
        {publishStatus === PENDING &&
          getLottieAnimation({
            animationData: pendingLottie,
            loop: true,
            status: PENDING,
          })}
        {publishStatus === SUCCESS &&
          getLottieAnimation({
            animationData: successLottie,
            loop: false,
            status: SUCCESS,
            onComplete: () => {
              setPublishStatus(null);
              if (getMode() === CANVAS_MODES.CMS_CANVAS) {
                closeHandler(false);
              }
            },
          })}
        {publishStatus === FAILED &&
          getLottieAnimation({
            animationData: failedLottie,
            loop: false,
            status: FAILED,
            onComplete: () => {
              setPublishStatus(null);
            },
          })}
      </div>
      {publishStatus === FAILED && (
        <AdvancedLabel
          leftAdornment={
            <Icon
              outeIconName="OUTEWarningIcon"
              outeIconProps={{
                "data-testid": "publish-status-warning-icon",
                sx: {
                  color: "#E88612",
                },
              }}
            />
          }
          labelText="Something went wrong."
          labelProps={{
            variant: "body1",
            "data-testid": "publish-status-error-message",
          }}
          sx={{
            width: "auto",
            maxWidth: "400px",
          }}
          data-testid="publish-status-error-label"
        />
      )}
    </div>
  );
};
