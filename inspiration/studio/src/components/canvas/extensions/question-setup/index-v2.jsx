import { forwardRef } from "react";
import BaseQuestionSetupV2 from "./components/base-question-setup/index-v2";
import { getDefaultMode, getDefaultViewPort, getQuestionConfig } from "./utils";
import {
  QuestionProvider,
  CanvasConfigProvider,
} from "@oute/oute-ds.core.contexts";

/** Self-contained: wraps in QuestionProvider so it works when used from Gate or anywhere else. */
export const QuestionSetupContentV2 = forwardRef((props, ref) => {
  const nodeData = props?.nodeData;
  const variables = props?.variables || {};
  const question = getQuestionConfig(nodeData || {});
  const mode = getDefaultMode(props?.eventType);
  const viewPort = getDefaultViewPort(props?.eventType);
  const theme = props?.defaultTheme || {};

  return (
    <QuestionProvider
      defaultMode={mode}
      defaultViewPort={viewPort}
      defaultQuestion={question}
      defaultTheme={theme}
    >
      <CanvasConfigProvider
        workspaceId={props?.workspaceId}
        assetId={props?.assetId}
        projectId={props?.projectId}
        parentId={props?.parentId}
        variables={variables}
        autoSave={props?.autoSave}
      >
        {nodeData?.type ? <BaseQuestionSetupV2 ref={ref} {...props} /> : null}
      </CanvasConfigProvider>
    </QuestionProvider>
  );
});
QuestionSetupContentV2.displayName = "QuestionSetupContentV2";

const QuestionSetupWrapperV2 = forwardRef((props, ref) => {
  const nodeData = props?.nodeData;
  const question = getQuestionConfig(nodeData || {});
  const mode = getDefaultMode(props?.eventType);
  const viewPort = getDefaultViewPort(props?.eventType);
  const theme = props?.defaultTheme || {};

  return (
    <QuestionProvider
      defaultMode={mode}
      defaultViewPort={viewPort}
      defaultQuestion={question}
      defaultTheme={theme}
    >
      <QuestionSetupContentV2 ref={ref} {...props} />
    </QuestionProvider>
  );
});

QuestionSetupWrapperV2.displayName = "QuestionSetupWrapperV2";

export default QuestionSetupWrapperV2;
