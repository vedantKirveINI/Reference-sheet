import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";
import { QuestionFiller } from "@oute/oute-ds.skeleton.question-filler";
import classes from "./index.module.css";
import { ViewPort } from "@oute/oute-ds.core.constants/constants";
import GetNudgeDialog from "../GetNudgeDialog";
import { forwardRef, useImperativeHandle, useState } from "react";
import { SUBMISSION_STATES } from "@oute/oute-ds.core.constants";

const Filler = forwardRef(
  (
    {
      submissionState,
      setSubmissionState,
      questions,
      theme,
      mode,
      viewPort,
      fillerRef,
      formName,
      onAnalyticsEvent,
      onEvent,
      variables,
      parentId,
      projectId,
      workspaceId,
      assetId,
      canvasId,
      openNodeWithTheme,
      onClose,
      showRemoveBranding,
      openFormSettings,
      hideBrandingButton,
      onRestart,
    },
    ref,
  ) => {
    const isDefaultTheme = theme?.name === "Default Theme";
    const [removeBranding, setRemoveBranding] = useState(hideBrandingButton);

    useImperativeHandle(ref, () => ({
      toogleBranding: () => {
        setRemoveBranding(!removeBranding);
      },
    }));
    return (
      <div className={classes["main-container"]}>
        <div
          style={{
            width: viewPort === ViewPort.DESKTOP ? "100%" : 400,
            height: "100%",
            overflow: "hidden",
            // maxWidth: viewPort === ViewPort.MOBILE ? 400 : "unset",
          }}
          className={classes["filler"]}
        >
          <GetNudgeDialog
            isDefaultTheme={isDefaultTheme}
            showRemoveBranding={showRemoveBranding && !hideBrandingButton}
            onClick={() => {
              if (isDefaultTheme) {
                openNodeWithTheme();
                onClose();
              } else if (showRemoveBranding) openFormSettings();
            }}
            viewPort={viewPort}
          />
          <div className={classes["container"]}>
            <QuestionFiller
              questions={questions}
              theme={theme}
              mode={mode}
              viewPort={viewPort}
              ref={fillerRef}
              isPreviewMode={true}
              variables={variables}
              onEvent={onEvent}
              resourceIds={{
                parentId: parentId,
                projectId: projectId,
                workspaceId: workspaceId,
                assetId: assetId,
                _id: "",
                canvasId: canvasId,
              }}
              onRestart={onRestart}
              submissionState={submissionState}
              onSuccess={() => {
                setSubmissionState(SUBMISSION_STATES.SUBMITTED);
                onAnalyticsEvent(UATU_CANVAS, {
                  formName: formName,
                  subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_SUCCESS,
                });
              }}
              hideBrandingButton={removeBranding}
            />
          </div>
        </div>
      </div>
    );
  },
);

export default Filler;
