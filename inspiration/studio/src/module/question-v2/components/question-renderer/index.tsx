import React, { forwardRef, lazy } from "react";

import { Mode } from "@oute/oute-ds.core.constants";
import { QuestionRendererProps } from "../../shared/lib/types";
import { SuspenseComponent } from "../suspense-component";

const LazyCardView = lazy(() =>
  import("../card-view").then((module) => ({ default: module.CardView }))
);
const LazyClassicView = lazy(() =>
  import("../classic-view").then((module) => ({ default: module.ClassicView }))
);
const LazyChatView = lazy(() =>
  import("../chat-view").then((module) => ({ default: module.ChatView }))
);

type QuestionViewComponentType = React.ForwardRefExoticComponent<
  QuestionRendererProps & React.RefAttributes<unknown>
>;

const getQuestionViewComponent = (
  displayMode: string
): QuestionViewComponentType => {
  const modeToComponentMap: Record<Mode, QuestionViewComponentType> = {
    [Mode.CARD]: LazyCardView,
    [Mode.CLASSIC]: LazyClassicView,
    [Mode.CHAT]: LazyChatView,
  };
  return modeToComponentMap[displayMode] || (() => <></>);
};

export const QuestionRenderer = forwardRef(
  (
    {
      uiConfig,
      handlers,
      questionData,
      stateConfig,
      value = "",
      autoFocus = false,
      error = "",
      id = "",
      loading = false,
      variables = {},
      questionIndex = "",
      nodeConfig,
      canvasConfig = {},
    }: QuestionRendererProps,
    ref
  ) => {
    const QuestionViewComponent = getQuestionViewComponent(uiConfig.mode);

    return (
      <SuspenseComponent fallback={<></>}>
        <QuestionViewComponent
          ref={ref}
          uiConfig={uiConfig}
          nodeConfig={nodeConfig}
          handlers={handlers}
          stateConfig={stateConfig}
          questionData={questionData}
          value={value}
          autoFocus={autoFocus}
          error={error}
          id={id}
          loading={loading}
          variables={variables}
          questionIndex={questionIndex}
          canvasConfig={canvasConfig}
        />
      </SuspenseComponent>
    );
  }
);
