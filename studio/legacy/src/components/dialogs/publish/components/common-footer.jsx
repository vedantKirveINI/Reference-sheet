import classes from "./common-footer.module.css";
// import ODSLabel from "oute-ds-label";
// import Button from "oute-ds-button";
// import Icon from "oute-ds-icon";
import { ODSLabel, ODSButton as Button, ODSIcon as Icon } from "@src/module/ods";
import { getFormattedDate } from "../../../../utils/utils";
import { getMode } from "../../../canvas/config";
import { CANVAS_MODES, getCanvasTheme } from "../../../../module/constants";

const CommonFooter = ({
  onSave = () => {},
  onPublish = () => {},
  assetDetails = {},
}) => {
  const canvasTheme = getCanvasTheme();
  return (
    <div
      className={classes["publishContainer"]}
      data-testid=""
      style={{
        borderTop: `0.0938rem solid ${canvasTheme?.dark}`,
      }}
    >
      <div className={classes["publishInfo"]}>
        {assetDetails?.asset?.published_info?.published_at ? (
          <Icon
            outeIconName="OUTEDoneIcon"
            outeIconProps={{
              "data-testid": "publish-info-icon",
              sx: { color: "#4CAF50" },
            }}
          />
        ) : null}
        <div className={classes["publishInfoContent"]}>
          <ODSLabel
            variant="body1"
            children={
              assetDetails?.asset?.published_info?.published_at
                ? `Last published on ${getFormattedDate(
                    assetDetails?.asset?.published_info?.published_at
                  )}`
                : ""
            }
            data-testid="publish-info-label"
          />
          {assetDetails?.asset?.published_info?.published_at &&
          getMode() === CANVAS_MODES.WORKFLOW_CANVAS ? (
            <ODSLabel
              variant="body2"
              children={
                "All new settings will be applied only after you republish"
              }
              data-testid="publish-info-caption"
              className={classes["publishInfoCaption"]}
            />
          ) : null}
        </div>
      </div>
      <div className={classes["button-group"]}>
        {/* <Button
          variant="black-outlined"
          onClick={onSave}
          label={"SAVE"}
          size={"large"}
          data-testid="form-publish-save-button"
        /> */}

        <Button
          startIcon={
            <Icon
              outeIconName="OUTEUploadIcon"
              outeIconProps={{
                "data-testid": "form-publish-upload-icon",
                sx: { color: "#fff" },
              }}
            />
          }
          variant="black"
          onClick={onPublish}
          label={"PUBLISH NOW"}
          size={"large"}
          data-testid="form-publish-save-button"
        />
      </div>
    </div>
  );
};

export default CommonFooter;
