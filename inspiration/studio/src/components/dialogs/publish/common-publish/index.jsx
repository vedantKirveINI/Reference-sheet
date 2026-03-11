import { useCallback, useEffect, useState } from "react";
import classes from "./index.module.css";
import { FAILED, PENDING, SUCCESS } from "../../../../constants/keys";
import canvasServices from "../../../../sdk-services/canvas-sdk-services";
import CommonFooter from "../components/common-footer";
import { PublishStatus } from "../components/publish-status";
import { getMode } from "../../../canvas/config";
// import DynamicSection from "oute-ds-dynamic-section";
import { ODSDynamicSection as DynamicSection } from "@src/module/ods";
import { CANVAS_MODES, getCanvasTheme } from "../../../../module/constants";
import Overlay from "../components/overlay";

const defaultConfig = {
  type: "section",
  disabled: true,
  childs: [
    {
      type: "description",
      value: "Published URL",
    },
    {
      type: "code",
      value: "Will be available after the workflow is published.",
    },
    {
      type: "description",
      value: "cURL",
    },
    {
      type: "code",
      value: "Will be available after the workflow is published.",
    },
  ],
};

const CommonPublish = ({
  nodes,
  initialAssetDetails,
  onClose,
  getSavePayload,
  onPublishSuccess,
}) => {
  const canvasTheme = getCanvasTheme();

  const [assetDetails, setAssetDetails] = useState(initialAssetDetails);
  const [publishStatus, setPublishStatus] = useState(null);
  const [isInitial, setIsInitial] = useState(true);

  const onPublishContentSave = useCallback(() => {
    onClose?.();
  }, [onClose]);

  const publishWorkflow = useCallback(async () => {
    setPublishStatus(PENDING);

    let assetMeta = {};

    let updatedAssetDetails = await getSavePayload(
      assetDetails?.asset?.name,
      assetDetails
    );
    updatedAssetDetails = {
      ...updatedAssetDetails,
      asset_meta: {
        ...updatedAssetDetails?.asset_meta,
        ...assetMeta,
      },
      settings: {
        execution_control: {
          enabled: true,
        },
      },
    };

    //this check is because save is called
    const saveCanvasResponse = await canvasServices.saveCanvas(
      updatedAssetDetails
    );
    const publishCanvasResponse = await canvasServices.publishCanvas(
      updatedAssetDetails
    );
    if (publishCanvasResponse?.status === SUCCESS) {
      setPublishStatus(SUCCESS);
      setAssetDetails({
        ...updatedAssetDetails,
        ...(saveCanvasResponse?.result || {}),
        asset: {
          ...updatedAssetDetails?.asset,
          published_info: {
            details: publishCanvasResponse?.result?.deployment_info,
            published_at: publishCanvasResponse?.result?.updated_at,
          },
        },
      });
      onPublishSuccess({
        ...updatedAssetDetails,
        ...(saveCanvasResponse?.result || {}),
        asset: {
          ...updatedAssetDetails?.asset,
          ...(saveCanvasResponse?.result?.asset || {}),
          published_info: {
            details: publishCanvasResponse?.result?.deployment_info,
            published_at: publishCanvasResponse?.result?.updated_at,
          },
        },
      });
      return { status: SUCCESS };
    } else {
      setPublishStatus(FAILED);
      return { status: FAILED, error: "Something Went Wrong !" };
    }
  }, [getSavePayload, assetDetails, onPublishSuccess]);

  useEffect(() => {
    if (getMode() === CANVAS_MODES.CMS_CANVAS && isInitial) {
      publishWorkflow();
    }
    setIsInitial(false);
  }, [publishWorkflow, isInitial]);

  return (
    <div
      className={classes["common-publish-container"]}
      style={{
        borderTop: `0.0938rem solid ${canvasTheme?.dark}`,
      }}
    >
      {publishStatus && <Overlay />}
      <div className={classes["common-publish-content"]}>
        {!publishStatus && getMode() === CANVAS_MODES.INTEGRATION_CANVAS && (
          <DynamicSection
            config={
              assetDetails?.asset?.published_info?.details?.formatted_data ||
              defaultConfig ||
              defaultConfig
            }
          />
        )}
        {publishStatus && (
          <PublishStatus
            publishStatus={publishStatus}
            setPublishStatus={setPublishStatus}
            closeHandler={onClose}
          />
        )}
      </div>
      {!publishStatus && (
        <CommonFooter
          assetDetails={assetDetails}
          onSave={onPublishContentSave}
          onPublish={publishWorkflow}
        />
      )}
    </div>
  );
};

export default CommonPublish;
