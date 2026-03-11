import { useCallback, useMemo, useState } from "react";
import classes from "./index.module.css";
import { getCanvasTheme } from "../../../../module/constants";
import Overlay from "../components/overlay";
import CommonFooter from "../components/common-footer";
import canvasServices from "../../../../sdk-services/canvas-sdk-services";
import { FAILED, PENDING, SUCCESS } from "../../../../constants/keys";
import { PublishStatus } from "../components/publish-status";
import TabContainer from "../../../tab-container";
import OverviewTab from "./tabs/overview";
import SettingsTab from "./tabs/settings";
import HistoryTab from "./tabs/history";
import { PUBLISH_POPPER_TABS } from "./constants";

const WorkflowPublish = ({
  nodes,
  initialAssetDetails,
  getSavePayload,
  onPublishSuccess,
  onClose,
  onAssetDetailsChange,
}) => {
  const canvasTheme = getCanvasTheme();
  const [assetDetails, setAssetDetails] = useState(initialAssetDetails);
  const [publishStatus, setPublishStatus] = useState(null);

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
    };

    if (!assetDetails?.asset?.published_info?.published_at) {
      updatedAssetDetails.settings = {
        execution_control: {
          enabled: true,
        },
      };
    }

    //this check is because save is called
    const saveCanvasResponse = await canvasServices.saveCanvas(
      updatedAssetDetails
    );
    const publishCanvasResponse = await canvasServices.publishCanvas(
      updatedAssetDetails
    );
    if (publishCanvasResponse?.status === SUCCESS) {
      setPublishStatus(SUCCESS);
      updatedAssetDetails = {
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
      };
      setAssetDetails(updatedAssetDetails);
      onPublishSuccess(updatedAssetDetails);
      return { status: SUCCESS };
    } else {
      setPublishStatus(FAILED);
      return { status: FAILED, error: "Something Went Wrong !" };
    }
  }, [getSavePayload, assetDetails, onPublishSuccess]);

  const tabData = useMemo(
    () => [
      {
        label: PUBLISH_POPPER_TABS.WORKFLOW_OVERVIEW,
        panelComponent: OverviewTab,
        panelComponentProps: {
          nodes,
          assetDetails,
        },
      },
      {
        label: PUBLISH_POPPER_TABS.WORKFLOW_SETTINGS,
        panelComponent: SettingsTab,
        panelComponentProps: {
          assetDetails,
          setAssetDetails,
          onAssetDetailsChange,
        },
      },
      {
        label: PUBLISH_POPPER_TABS.WORKFLOW_HISTORY,
        panelComponent: HistoryTab,
        panelComponentProps: {
          assetDetails,
        },
      },
    ],
    [assetDetails, nodes, setAssetDetails, onAssetDetailsChange]
  );

  return (
    <div
      className={`${classes["workflow-publish-container"]} ${
        publishStatus ? classes["publish-status-container"] : ""
      }`}
      style={{
        borderTop: publishStatus
          ? `0.0938rem solid ${canvasTheme?.dark}`
          : "none",
      }}
      data-testid="workflow-publish-container"
    >
      {publishStatus && <Overlay />}
      {publishStatus && (
        <PublishStatus
          publishStatus={publishStatus}
          setPublishStatus={setPublishStatus}
          closeHandler={onClose}
        />
      )}
      {!publishStatus && (
        <div className={classes["tab-container-wrapper"]}>
          <TabContainer
            tabs={tabData || []}
            colorPalette={{
              foreground: canvasTheme?.foreground,
              dark: canvasTheme?.dark,
              light: canvasTheme?.light,
              background: canvasTheme?.background,
            }}
          />
        </div>
      )}
      {!publishStatus && (
        <CommonFooter
          assetDetails={assetDetails}
          onPublish={publishWorkflow}
          onSave={() => {}}
        />
      )}
    </div>
  );
};

export default WorkflowPublish;
