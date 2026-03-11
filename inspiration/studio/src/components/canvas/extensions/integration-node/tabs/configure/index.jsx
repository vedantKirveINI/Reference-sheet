import { useCallback, useState, useEffect } from "react";
import classes from "./index.module.css";
import { THEME } from "../../constant/default-theme";
import { INTEGRATION_TYPE } from "../../../constants/types";
import { Integration } from "@src/module/integration-v3";
import { getMergedVariables } from "../../utils/get-merged-variables";
import { variableSDKServices } from "@oute/oute-ds.common.core.utils";
import { sanitizeInitialPipeline } from "../../utils";

const ConnectionConfigurationMode = ({
  nodeTheme = {},
  result = {},
  flow = {},
  projectVariables = {},
  getInitialAnswers = () => {},
  initialPipeline = [],
  annotation,
  resourceIds = {},
  variables = {},
  onConfigureDone = () => {},
  node_configs = {},
  onAnswerChange = () => {},
  onIntegrationStateChange = () => {},
}) => {
  const onSuccess = useCallback(
    async (answers, pipeline, configs) => {
      console.log("[ConfigureTab] onSuccess called", { 
        answers: answers ? "present" : "missing",
        pipeline: pipeline?.length || 0,
        configs: configs ? "present" : "missing"
      });
      const flowTemp = { ...result, id: result?._id };
      const allVariables = getMergedVariables(projectVariables, variables);

      const allVariablesState =
        await variableSDKServices.transformedToState(allVariables);

      let allVariablesStateResult = structuredClone(
        allVariablesState?.result || {}
      );

      delete allVariablesStateResult[resourceIds?.assetId];
      delete allVariablesStateResult[resourceIds?.projectId];
      delete answers[resourceIds?.projectId];
      delete answers[resourceIds?.assetId];

      onAnswerChange(answers);

      const configuredData = {
        type: INTEGRATION_TYPE,
        state: {
          ...answers,
          pipeline,
          parentId: resourceIds?.parentId,
          projectId: resourceIds?.projectId,
          workspaceId: resourceIds?.workspaceId,
          assetId: resourceIds?.assetId,
          token: window.accessToken,
          ...(allVariablesStateResult || {}),
        },
        flow: flowTemp,
        configs,
      };

      console.log("[ConfigureTab] Calling onConfigureDone");
      onConfigureDone(configuredData);
      console.log("[ConfigureTab] onConfigureDone call completed");
    },
    [
      onConfigureDone,
      projectVariables,
      resourceIds?.assetId,
      resourceIds?.parentId,
      resourceIds?.projectId,
      resourceIds?.workspaceId,
      result,
      variables,
      onAnswerChange,
    ]
  );

  const handleStateChange = useCallback((state) => {
    onIntegrationStateChange(state);
  }, [onIntegrationStateChange]);

  return (
    <div className={classes["form-node-container"]}>
      <div style={{ display: "flex" }} className={classes["form-container"]}>
        <Integration
          nodeTheme={nodeTheme}
          theme={THEME}
          initialAnswers={getInitialAnswers()}
          initialPipeline={sanitizeInitialPipeline(initialPipeline, flow)}
          allNodes={flow}
          annotation={annotation}
          onSuccess={onSuccess}
          variables={variables}
          workspaceId={resourceIds?.workspaceId}
          projectId={resourceIds?.projectId}
          assetId={resourceIds?.assetId}
          canvasId={resourceIds?.canvasId}
          _id={resourceIds?._id}
          configs={node_configs}
          onAnswerUpdate={onAnswerChange}
          onStateChange={handleStateChange}
        />
      </div>
    </div>
  );
};

ConnectionConfigurationMode.displayName = "ConnectionConfigurationMode";

export default ConnectionConfigurationMode;
