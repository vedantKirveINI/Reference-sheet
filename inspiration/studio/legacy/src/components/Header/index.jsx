import { getMode } from "../canvas/config";
import { getFormattedDate, getIcon } from "../../utils/utils";
import classes from "./index.module.css";
import {
  ADD_ASSET_ID_DIALOG,
  PREVIEW_DIALOG,
  WORKFLOW_NAME_DIALOG,
} from "../../pages/ic-canvas/constants/constants";
// import ODSLabel from "oute-ds-label";
// import Icon from "oute-ds-icon";
import { ODSLabel, ODSIcon as Icon, ODSButton as Button } from "@src/module/ods";
import TooltipWrapper from "../tooltip-wrapper";
import { MODE } from "../../constants/mode";
import FormResponseCTA from "../form-responses-cta";
import { lazy, useCallback, useMemo } from "react";

const CMSFormPreviewDialog = lazy(() =>
  import("../dialogs/cms-form-preview-dialog")
);
const WorkflowActiveSwtich = lazy(() => import("./WorkflowActiveSwitch"));

const Header = ({
  setDialogComponent,
  assetDetails,
  getSaveDialogTitle,
  isDraft,
  updateWorkflow,
  saveButtonRef,
  loading,
  isRunning,
  executeWorkflow,
  setLoading,
  executeRunRef,
  nodeCount,
  assetId,
  publishBtnRef,
  defaultDrawerRef,
  variablesRef,
  getFormPreviewPayload,
  onAssetDetailsChange,
}) => {
  const mode = useMemo(() => getMode(), []);

  const handleFormPreview = useCallback(() => {
    if (mode === MODE.WORKFLOW_CANVAS) {
      setDialogComponent(PREVIEW_DIALOG);
    }
    if (mode === MODE.CMS_CANVAS) {
      defaultDrawerRef.current?.openSidebarPanel({
        id: "cms-preview",
        name: assetDetails?.asset?.name,
        panel: (
          <CMSFormPreviewDialog
            variables={variablesRef.current}
            payload={getFormPreviewPayload(assetDetails?.asset?.name)}
            workflowName={assetDetails?.asset?.name}
            onClose={() => {
              defaultDrawerRef?.current?.closeSidebarPanel();
            }}
          />
        ),
      });
    }
  }, [
    assetDetails?.asset?.name,
    defaultDrawerRef,
    getFormPreviewPayload,
    mode,
    setDialogComponent,
    variablesRef,
  ]);

  const isPublished = assetDetails?.asset?.published_info?.published_at;

  return (
    <div className={classes["top-cta-container"]}>
      <div className={classes["icon-wrapper"]}>{getIcon(mode)}</div>

      <div className={classes["title-container"]}>
        <div
          className={classes["title-row"]}
          onClick={() => setDialogComponent(WORKFLOW_NAME_DIALOG)}
        >
          <ODSLabel
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: "1.125rem",
              lineHeight: 1.5,
              color: "#1a1a1a",
              maxWidth: "20rem",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            data-testid="title"
          >
            {assetDetails?.asset?.name ||
              `Untitled ${getSaveDialogTitle(mode)}`}
          </ODSLabel>

          <Icon
            outeIconName="OUTEEditIcon"
            outeIconProps={{
              "data-testid": "rename-edit-icon",
            }}
          />
        </div>

        {isPublished ? (
          <ODSLabel
            variant="body2"
            sx={{
              fontSize: "0.8125rem",
              lineHeight: 1.4,
              color: "#78909c",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
            data-testid="published-timestamp"
          >
            {`Last published on ${getFormattedDate(isPublished)}`}
          </ODSLabel>
        ) : assetDetails?.asset?.edited_at ? (
          <ODSLabel
            variant="body2"
            sx={{
              fontSize: "0.8125rem",
              lineHeight: 1.4,
              color: "#78909c",
              fontWeight: 400,
              letterSpacing: "0.01em",
            }}
            data-testid="saved-timestamp"
          >
            {`Last saved on ${getFormattedDate(
              assetDetails?.asset?.edited_at
            )}`}
          </ODSLabel>
        ) : null}
      </div>

      <div className={classes["vertical-divider"]} />

      <div className={classes["status-section"]}>
        <div
          className={`${classes["status-chip"]} ${
            !isDraft && classes["published"]
          }`}
          data-testid="status-indicator"
        >
          <span className={classes["status-dot"]}></span>
          {isDraft ? "DRAFT" : "PUBLISHED"}
        </div>
      </div>

      <div className={classes["actions-section"]}>
        {mode === MODE.CMS_CANVAS && (
          <Button
            label="ADD ASSET ID"
            variant="black"
            size="large"
            onClick={() => setDialogComponent(ADD_ASSET_ID_DIALOG)}
            sx={{
              height: "2.75rem",
              borderRadius: "0.875rem",
              padding: "0.625rem 1.25rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              letterSpacing: "0.02em",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.18)",
              },
            }}
          />
        )}

        {mode === MODE.WC_CANVAS && (
          <WorkflowActiveSwtich
            isPublished={!!assetDetails?.asset?.published_info?.published_at}
            settings={assetDetails?.asset?.settings}
            assetId={assetDetails?.asset?._id}
            onSettingsChange={onAssetDetailsChange}
          />
        )}

        <TooltipWrapper
          title="Save"
          data-testid="save-icon"
          component={Button}
          onClick={() => {
            updateWorkflow({
              name: assetDetails?.asset?.name,
              description: assetDetails?.asset?.meta?.description,
            });
          }}
          ref={saveButtonRef}
          disabled={Boolean(loading)}
          variant="black-text"
          size="large"
          sx={{
            minWidth: "unset",
            width: "2.75rem",
            padding: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: "rgba(0, 0, 0, 0.06)",
              transform: "translateY(-2px)",
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            },
          }}
          startIcon={
            <img
              src="https://cdn-v1.tinycommand.com/1234567890/1754542920412/save.svg"
              alt="save icon"
              data-testid="canvas-save-icon"
            />
          }
        />

        {(mode === MODE.INTEGRATION_CANVAS || mode === MODE.WC_CANVAS) &&
          !isRunning && (
            <TooltipWrapper
              component={Icon}
              title="Execute"
              outeIconName="OUTEPlayIcon"
              outeIconProps={{
                sx: {
                  color: "#212121",
                  width: "2.75rem",
                  height: "2.75rem",
                  borderRadius: "0.875rem",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "rgba(33, 33, 33, 0.08)",
                    transform: "translateY(-2px)",
                    color: "#000000",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.12)",
                  },
                },
              }}
              onClick={executeWorkflow}
              data-testid={"execute-workflow-button"}
            />
          )}

        {(mode === MODE.INTEGRATION_CANVAS || mode === MODE.WC_CANVAS) &&
          isRunning && (
            <Button
              onClick={() => {
                setLoading("Stopping... Please wait.");
                executeRunRef.current.abort();
              }}
              label={"STOP"}
              size="large"
              color={"error"}
              sx={{
                height: "2.75rem",
                borderRadius: "0.875rem",
                padding: "0.625rem 1.25rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                letterSpacing: "0.02em",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 20px rgba(211, 47, 47, 0.35)",
                },
              }}
            />
          )}

        {(mode === MODE.WORKFLOW_CANVAS || mode === MODE.CMS_CANVAS) &&
          nodeCount > 0 && (
            <TooltipWrapper
              title="Preview"
              component={Button}
              onClick={handleFormPreview}
              label={isPublished ? "" : "PREVIEW"}
              endIcon={
                <img
                  src="https://cdn-v1.tinycommand.com/1234567890/1754542917411/run.svg"
                  alt="play icon"
                  data-testid="canvas-preview-icon"
                  style={{
                    width: isPublished ? "1.125rem" : "1rem",
                    height: isPublished ? "1.125rem" : "1rem",
                  }}
                />
              }
              sx={{
                minWidth: isPublished ? "unset" : "max-content",
                width: isPublished ? "2.75rem" : "auto",
                height: "2.75rem",
                borderRadius: "0.875rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.12)",
                },
              }}
              variant={isPublished ? "black-text" : "black-outlined"}
              size="large"
              data-testid="form-preview-button"
            />
          )}

        {mode === MODE.WORKFLOW_CANVAS && isPublished && (
          <FormResponseCTA assetId={assetId} assetDetails={assetDetails} />
        )}

        <Button
          onClick={() =>
            updateWorkflow(
              {
                name: assetDetails?.asset?.name,
                description: assetDetails?.asset?.meta?.description,
              },
              {
                isPublish: true,
              }
            )
          }
          sx={{
            minWidth: "max-content",
            height: "2.75rem",
            borderRadius: "1.25rem",
            padding: "0.625rem 1.25rem",
            fontSize: "0.875rem",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.12)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.18)",
            },
          }}
          label="REVIEW & PUBLISH"
          variant="black"
          size="large"
          ref={publishBtnRef}
          endIcon={
            <Icon
              outeIconName="OUTEChevronLeftIcon"
              outeIconProps={{
                sx: {
                  transform: "rotate(270deg)",
                  color: "#fff",
                },
              }}
            />
          }
        />
      </div>
    </div>
  );
};

export default Header;
