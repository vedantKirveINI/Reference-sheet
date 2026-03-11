import React from "react";
import ConnectionConfigurationMode from "../../../form/tabs/configure";
import { removeFirstKeyValuePair } from "../../../form/utils/remove-first-key-value-pair";
import TRIGGER_SETUP_NODE from "../../constant";

const ConnectionConfigurationSetup = ({
  eventData,
  variables,
  nodeData,
  configureData,
  onConfigureDone = () => {},
}) => {
  if (eventData?.loading) return <></>;

  return (
    <ConnectionConfigurationMode
      nodeTheme={{
        background: TRIGGER_SETUP_NODE?.background,
        foreground: TRIGGER_SETUP_NODE?.foreground,
        dark: TRIGGER_SETUP_NODE?.dark,
        light: TRIGGER_SETUP_NODE?.light,
      }}
      result={eventData?.publishResult}
      flow={removeFirstKeyValuePair(eventData?.flow)}
      taskGraph={eventData?.taskGraph}
      projectVariables={eventData?.projectVariables}
      getInitialAnswers={() => configureData?.state}
      onAnswerChange={() => {}}
      initialPipeline={configureData?.state?.pipeline}
      annotation={eventData?.annotation}
      resourceIds={eventData?.resourceIds}
      variables={variables}
      onConfigureDone={onConfigureDone}
      nodeData={nodeData}
      node_configs={configureData?.configs}
    />
  );
};

export default ConnectionConfigurationSetup;
