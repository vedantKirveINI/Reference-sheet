import { useCallback } from "react";
import classes from "./index.module.css";
import { THEME } from "../../constant/default-theme";
import { INTEGRATION_TYPE } from "../../../constants/types";
import { Integration } from "@oute/oute-ds.common.molecule.integration-v2";
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
}) => {
  const onSuccess = useCallback(
    async (answers, pipeline, configs) => {
      const flowTemp = { ...result, id: result?._id };
      const allVariables = getMergedVariables(projectVariables, variables);

      const allVariablesState =
        await variableSDKServices.transformedToState(allVariables);

      let allVariablesStateResult = structuredClone(
        allVariablesState?.result || {}
      );

      // Delete user variables as they're accessible at root level
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

      onConfigureDone(configuredData);
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
        />
      </div>
    </div>
  );
};

export default ConnectionConfigurationMode;
