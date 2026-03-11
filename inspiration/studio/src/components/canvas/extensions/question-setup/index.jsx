import { forwardRef } from "react";
import BaseQuestionSetup from "./components/base-question-setup";
import { getDefaultMode, getDefaultViewPort, getQuestionConfig } from "./utils";
import {
  QuestionProvider,
  CanvasConfigProvider,
} from "@oute/oute-ds.core.contexts";

const QuestionSetupWrapper = forwardRef((props, ref) => {
  const question = getQuestionConfig(props?.nodeData || {});
  const mode = getDefaultMode(props?.eventType);
  const viewPort = getDefaultViewPort(props?.eventType);
  const variables = props?.variables || {};
  const theme = props?.defaultTheme || {};

  return (
    <CanvasConfigProvider
      workspaceId={props?.workspaceId}
      assetId={props?.assetId}
      projectId={props?.projectId}
      parentId={props?.parentId}
      variables={variables}
      autoSave={props?.autoSave}
    >
      <QuestionProvider
        defaultMode={mode}
        defaultViewPort={viewPort}
        defaultQuestion={question}
        defaultTheme={theme}
      >
        <BaseQuestionSetup ref={ref} {...props} />
      </QuestionProvider>
    </CanvasConfigProvider>
  );
});

export default QuestionSetupWrapper;
