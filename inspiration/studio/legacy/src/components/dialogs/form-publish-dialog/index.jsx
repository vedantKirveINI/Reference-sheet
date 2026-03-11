import { useCallback, useEffect, useRef, useState } from "react";
import classes from "./index.module.css";

import canvasServices from "../../../sdk-services/canvas-sdk-services";
import { SUCCESS } from "../../../constants/keys";
import Header from "./components/Header";

import Filler from "./components/Filler";
import { cookieUtils } from "oute-ds-utils";
import {
  localStorageConstants,
  Mode,
  SUBMISSION_STATES,
  ViewPort,
} from "@oute/oute-ds.core.constants";
import Publish from "./components/Publish";
import { showAlert } from "oute-ds-alert";
import { FormPublishProvider } from "../publish/context/form-publish-context";
import FillerEmbedPreview from "./components/FillerEmbedPreview";

import { ACCORDION_IDS as FORM_SETTINGS_ACCORDIAN } from "../publish/forms/tabs/form-settings";

const BaseFormPublish = ({
  userData = {},
  initialAssetDetails,
  nodes,
  getSavePayload,
  onPublishSuccess,
  onCustomDomainDataChange,
  onAnalyticsEvent,
  onClose,
  payload,
  params,
  variables,
  onEvent,
  theme,
  openNodeWithTheme = () => {},
  isPremiumUser,
}) => {
  const fillerRef = useRef(null);
  const fillerEmbedPreviewRef = useRef(null);
  const publishTabRef = useRef(null);
  const formSettingsRef = useRef(null);
  const brandingRef = useRef(null);
  const [nodesForPreview, setNodesForPreview] = useState(null);
  const [submissionState, setSubmissionState] = useState(
    SUBMISSION_STATES.IDLE,
  );
  const [mode, setMode] = useState(
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_MODE) ||
      Mode.CARD,
  );
  const [viewPort, setViewPort] = useState(
    cookieUtils?.getCookie(localStorageConstants.QUESTION_CREATOR_VIEWPORT) ||
      ViewPort.DESKTOP,
  );
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  const onToggleEmbedPreview = useCallback((show) => {
    setShowEmbedPreview(show);
  }, []);

  const projectId = payload?.project_id;
  const workspaceId = payload?.workspace_id;
  const canvasId = payload?._id;
  const parentId = payload?.parent_id;
  const allVariables = { ...params, ...variables };

  const onRestart = useCallback(() => {
    if (showEmbedPreview) {
      fillerEmbedPreviewRef.current?.restart();
    } else {
      fillerRef.current?.restart();
    }
  }, [showEmbedPreview]);

  const hideBrandingToogle = () => {
    if (brandingRef.current) brandingRef.current.toogleBranding();
  };

  console.log("nodesForPreview", nodesForPreview);

  const openFormSettings = () => {
    if (publishTabRef.current) {
      formSettingsRef.current = {
        ...formSettingsRef.current,
        formSettingAccordianId: FORM_SETTINGS_ACCORDIAN.REMOVE_BRANDING,
        removeBranding: true,
      };
      hideBrandingToogle();
      publishTabRef.current?.goToTab?.(1);
    }
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e?.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (payload) {
      canvasServices
        .canvasToPublished(payload)
        .then((res) => {
          console.log("res", res);
          if (res.status === SUCCESS) {
            setNodesForPreview(res?.result?.flow);
          }
        })
        .catch(() => onClose());
    }
  }, [onClose, payload]);

  return (
    <div className={classes["container"]}>
      <div className={classes["left-container"]}>
        <Header
          mode={mode}
          setMode={setMode}
          viewPort={viewPort}
          setViewPort={setViewPort}
          onClose={onClose}
          onRestart={onRestart}
          submissionState={submissionState}
          setSubmissionState={setSubmissionState}
        />
        {nodesForPreview && !showEmbedPreview ? (
          <Filler
            submissionState={submissionState}
            setSubmissionState={setSubmissionState}
            ref={brandingRef}
            questions={nodesForPreview}
            theme={theme}
            mode={mode}
            viewPort={viewPort}
            fillerRef={fillerRef}
            formName={initialAssetDetails?.asset?.name}
            onAnalyticsEvent={onAnalyticsEvent}
            onEvent={onEvent}
            variables={allVariables}
            parentId={parentId}
            projectId={projectId}
            workspaceId={workspaceId}
            assetId={initialAssetDetails?.asset_id}
            canvasId={canvasId}
            openNodeWithTheme={openNodeWithTheme}
            onClose={onClose}
            showRemoveBranding={isPremiumUser}
            hideBrandingButton={
              initialAssetDetails?.asset?.settings?.form?.remove_branding
            }
            onRestart={() => {
              setSubmissionState(SUBMISSION_STATES.IDLE);
            }}
            openFormSettings={openFormSettings}
          />
        ) : (
          <FillerEmbedPreview
            ref={fillerEmbedPreviewRef}
            viewPort={viewPort}
            mode={mode}
          />
        )}
      </div>
      <Publish
        ref={publishTabRef}
        nodes={nodes}
        userData={userData}
        getSavePayload={getSavePayload}
        onPublishSuccess={onPublishSuccess}
        onCustomDomainDataChange={onCustomDomainDataChange}
        onAnalyticsEvent={onAnalyticsEvent}
        onClose={(e) => {
          onClose(e);
          showAlert({
            message: "Published successfully",
            type: "success",
          });
        }}
        onToggleEmbedPreview={onToggleEmbedPreview}
        mode={mode}
        formSettingsRef={formSettingsRef}
        isPremiumUser={isPremiumUser}
        hideBrandingToogle={hideBrandingToogle}
      />
    </div>
  );
};

const FormPublishDialog = ({
  userData = {},
  payload,
  theme,
  getSavePayload,
  initialAssetDetails,
  onPublishSuccess,
  onCustomDomainDataChange,
  nodes,
  onClose = () => {},
  params = {},
  variables = {},
  onEvent = () => {},
  onAnalyticsEvent = () => {},
  openNodeWithTheme = () => {},
  isPremiumUser,
}) => {
  return (
    <FormPublishProvider initialAssetDetails={initialAssetDetails}>
      <BaseFormPublish
        userData={userData}
        initialAssetDetails={initialAssetDetails}
        nodes={nodes}
        getSavePayload={getSavePayload}
        onPublishSuccess={onPublishSuccess}
        onCustomDomainDataChange={onCustomDomainDataChange}
        onAnalyticsEvent={onAnalyticsEvent}
        onClose={onClose}
        payload={payload}
        params={params}
        variables={variables}
        openNodeWithTheme={openNodeWithTheme}
        onEvent={onEvent}
        theme={theme}
        isPremiumUser={isPremiumUser}
      />
    </FormPublishProvider>
  );
};

export default FormPublishDialog;
