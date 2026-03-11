import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ODSDialog as Dialog,
  ODSCircularProgress,
} from "@src/module/ods";
import canvasServices from "../../../sdk-services/canvas-sdk-services";
import { SUCCESS } from "../../../constants/keys";
import { Suspense } from "react";
import SelectTheme from "../../SelectTheme";
import { localStorageConstants, ViewPort } from "../../../module/constants";
// import { cookieUtils } from "oute-ds-utils";
// import { QuestionPreview } from "@oute/oute-ds.skeleton.question-preview";
const QuestionPreview = React.lazy(() =>
  import("@oute/oute-ds.skeleton.question-preview").then((module) => ({
    default: module.QuestionPreview,
  })),
);

const FormPreviewDialog = ({
  payload,
  workflowName,
  onPublish = () => {},
  onClose = () => {},
  params = {},
  variables = {},
  onEvent = () => {},
  assetId,
  theme,
  onAnalyticsEvent = () => {},
  openNodeWithTheme,
  hideBranding = false,
}) => {
  const [nodesForPreview, setNodesForPreview] = useState(null);

  const [viewPort, setViewPort] = useState(
    (typeof localStorage !== "undefined" && localStorage.getItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT)) ||
      ViewPort.DESKTOP,
  );

  const onViewPortChange = (viewPort) => {
    setViewPort(viewPort);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT, viewPort);
    }
  };

  const projectId = payload?.project_id;
  const workspaceId = payload?.workspace_id;
  const canvasId = payload?._id;
  const parentId = payload?.parent_id;
  const allVariables = { ...params, ...variables };

  useEffect(() => {
    if (payload) {
      canvasServices
        .canvasToPublished(payload)
        .then((res) => {
          if (res?.status === SUCCESS) {
            setNodesForPreview(res?.result?.flow);
          } else {
            toast.error("Unable to load form preview. Please try again.");
            onClose();
          }
        })
        .catch(() => {
          toast.error("Failed to load form preview. Please try again.");
          onClose();
        });
    }
  }, [onClose, payload]);
  return (
    <Dialog
      dialogTitle=""
      showFullscreenIcon={false}
      showCloseIcon={false}
      open={true}
      onClose={onClose}
      transition="slide"
      dialogWidth="100%"
      dialogHeight="100%"
      style={{
        ".MuiDialogContent-root": {
          position: "relative",
        },
      }}
      dialogContent={
        <>
          {!nodesForPreview && (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ODSCircularProgress />
            </div>
          )}
          {nodesForPreview && (
            <Suspense fallback={null}>
              {theme?.name === "Default Theme" && (
                <div
                  style={{
                    position: "absolute",
                    zIndex: 100,
                    left: 0,
                    right: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    top: "7em",
                  }}
                >
                  <SelectTheme
                    onClick={() => {
                      openNodeWithTheme();
                      onClose();
                    }}
                    style={{
                      width: viewPort === ViewPort.MOBILE ? "25%" : "75%",
                    }}
                    viewPort={viewPort}
                  />
                </div>
              )}
              <QuestionPreview
                onClickBack={onClose}
                nodes={nodesForPreview}
                formName={workflowName}
                theme={theme}
                handlePublishDialog={onPublish}
                variables={allVariables}
                onEvent={onEvent}
                resourceIds={{
                  parentId: parentId,
                  projectId: projectId,
                  workspaceId: workspaceId,
                  assetId: assetId,
                  _id: "",
                  canvasId: canvasId,
                }}
                onViewPortChange={onViewPortChange}
                onAnalyticsEvent={onAnalyticsEvent}
                hideBrandingButton={hideBranding}
              />
            </Suspense>
          )}
        </>
      }
      removeContentPadding
    />
  );
};

export default FormPreviewDialog;
