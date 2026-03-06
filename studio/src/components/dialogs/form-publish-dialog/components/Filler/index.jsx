import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";
import { QuestionFiller } from "@oute/oute-ds.skeleton.question-filler";
import classes from "./index.module.css";
import { ViewPort } from "../../../../../module/constants";
import GetNudgeDialog from "../GetNudgeDialog";
import { forwardRef, useImperativeHandle, useState } from "react";
import { motion } from "framer-motion";

const Filler = forwardRef(
  (
    {
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
      /** When provided, clicking the default-theme banner button calls this instead of openNodeWithTheme+onClose (e.g. to open theme section in publish panel). */
      onBannerThemeClick,
      /** When provided, "Remove Branding" banner click only navigates (no toggle). Use so branding visibility is not flipped. */
      onRemoveBrandingClick,
    },
    ref
  ) => {
    const isDefaultTheme =
      !theme ||
      theme?.name === "Default Theme" ||
      theme?.name === "Default";
    const [removeBranding, setRemoveBranding] = useState(hideBrandingButton);

    useImperativeHandle(ref, () => ({
      toogleBranding: () => {
        setRemoveBranding(!removeBranding);
      },
    }));
    return (
      <div className={classes["main-container"]}>
        <motion.div
          initial={false}
          animate={{
            width: viewPort === ViewPort.DESKTOP ? "100%" : 400,
            height: "100%",
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className={classes["filler"]}
          style={{
            overflow: "hidden",
          }}
        >
          <GetNudgeDialog
            isDefaultTheme={isDefaultTheme}
            showRemoveBranding={showRemoveBranding && !hideBrandingButton}
            onClick={() => {
              if (isDefaultTheme) {
                if (onBannerThemeClick) {
                  onBannerThemeClick();
                } else {
                  openNodeWithTheme();
                  onClose();
                }
              } else if (showRemoveBranding) {
                if (onRemoveBrandingClick) {
                  if (!removeBranding) {
                    openFormSettings?.();
                  } else {
                    onRemoveBrandingClick();
                  }
                } else {
                  openFormSettings?.();
                }
              }
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
              onSuccess={() => {
                onAnalyticsEvent(UATU_CANVAS, {
                  formName: formName,
                  subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_SUCCESS,
                });
              }}
              hideBrandingButton={removeBranding}
            />
          </div>
        </motion.div>
      </div>
    );
  }
);

export default Filler;
