import React, { useEffect, useRef, useState } from "react";
import { QuestionFiller } from "@oute/oute-ds.skeleton.question-filler";
import { localStorageConstants, Mode, ViewPort, type SubmissionState } from "@src/module/constants";
import { DEFAULT_THEME } from "@/module/panels/ThemeManager/constants";

import { getQuestionPreviewContainerStyles, getQuestionFillerWrapperStyles,  } from "./styles";
import Header from "./components/header";
import { UATU_CANVAS, UATU_PREDICATE_EVENTS_CANVAS,  } from "@oute/oute-ds.common.core.utils";
export const QuestionPreview = ({
  onClickBack,
  nodes,
  formName,
  theme = DEFAULT_THEME,
  handlePublishDialog,
  variables = {},
  onEvent = () => {},
  resourceIds = {},
  onAnalyticsEvent = () => {},
  onViewPortChange = () => {},
  hideBrandingButton = false,
}: any) => {
  const fillerRef = useRef(null);
  const [submissionState, setSubmissionState] = useState<SubmissionState>("IDLE");

  const questions = nodes;

  const [mode, setMode] = React.useState<string>(
    (typeof localStorage !== "undefined" && localStorage.getItem(localStorageConstants.QUESTION_CREATOR_MODE)) ||
      Mode.CARD
  );

  const [viewPort, setViewPort] = React.useState(
    (typeof localStorage !== "undefined" && localStorage.getItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT)) ||
      ViewPort.DESKTOP
  );

  useEffect(() => {
    onAnalyticsEvent(UATU_CANVAS, {
      formName: formName,
      subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_START,
      themeName: theme.name,
      mode: mode,
      viewPort: viewPort,
    });

    return () => {
      onAnalyticsEvent(UATU_CANVAS, {
        formName: formName,
        subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_END,
      });
    };
  }, []);

  return (
    <section style={getQuestionPreviewContainerStyles}>
      <Header
        onClickBack={onClickBack}
        mode={mode}
        onModeChange={(_mode) => {
          setSubmissionState("IDLE");
          setMode(_mode);
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(localStorageConstants.QUESTION_CREATOR_MODE, _mode);
          }
        }}
        viewPort={viewPort}
        onViewPortChange={(_viewPort) => {
          setSubmissionState("IDLE");
          setViewPort(_viewPort);
          if (typeof localStorage !== "undefined") {
            localStorage.setItem(localStorageConstants.QUESTION_CREATOR_VIEWPORT, _viewPort);
          }
          onViewPortChange(_viewPort);
        }}
        onRestart={() => {
          fillerRef.current.restart();
        }}
        handlePublishDialog={handlePublishDialog}
      />
      <main
        style={getQuestionFillerWrapperStyles({ viewPort })}
        data-testid="question-filler-wrapper"
      >
        <QuestionFiller
          questions={questions}
          theme={theme}
          mode={mode}
          viewPort={viewPort}
          ref={fillerRef}
          isPreviewMode={true}
          variables={variables}
          onEvent={onEvent}
          resourceIds={resourceIds}
          onSuccess={async () => {
            onAnalyticsEvent(UATU_CANVAS, {
              formName: formName,
              subEvent: UATU_PREDICATE_EVENTS_CANVAS.FORM_PREVIEW_SUCCESS,
            });
          }}
          onSubmissionStateChange={(state) => {
            setSubmissionState(state);
          }}
          onRestart={() => {
            setSubmissionState("IDLE");
          }}
          submissionState={submissionState}
          hideBrandingButton={hideBrandingButton}
        />
      </main>
    </section>
  );
};
