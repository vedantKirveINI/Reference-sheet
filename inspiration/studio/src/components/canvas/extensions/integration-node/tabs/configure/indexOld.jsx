import { useCallback, useRef, useState } from "react";
import classes from "./index.module.css";
import { THEME } from "../../constant/default-theme";
import { INTEGRATION_TYPE } from "../../../constants/types";
// import { QuestionFiller } from "@oute/oute-ds.common.molecule.integration";
import { getMergedVariables } from "../../utils/get-merged-variables";
import { variableSDKServices } from "@oute/oute-ds.common.core.utils";
// import { ODSButton } from '@src/module/ods';
// import { ODSSwitch } from '@src/module/ods';
import { ODSButton, ODSSwitch } from "@src/module/ods";
import { sanitizeInitialPipeline } from "../../utils";
import AdvancedSettings from "./advanced";
import { getCanvasTheme } from "../../../../../../module/constants";

const ConnectionConfigurationMode = ({
  result = {},
  flow = {},
  taskGraph = [],
  projectVariables = {},
  initialAnswers = {},
  initialPipeline = [],
  annotation,
  resourceIds = {},
  variables = {},
  onConfigureDone = () => {},
  nodeData,
}) => {
  const fillerRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState(nodeData?.go_data?.configs || {});
  const [isAdvancedEnabled, setIsAdvancedEnabled] = useState(
    !!Object.keys(nodeData?.go_data?.configs || {})?.length
  );
  const canvasTheme = getCanvasTheme();

  const onNextClick = useCallback(async () => {
    setIsLoading(true);
    await fillerRef.current.onSubmit();
    setIsLoading(false);
  }, []);

  const onSuccess = useCallback(
    async (answers, pipeline) => {
      const flowTemp = { ...result, id: result?._id };
      const allVariables = getMergedVariables(projectVariables, variables);

      const allVariablesState = await variableSDKServices.transformedToState(
        allVariables
      );

      let allVariablesStateResult = structuredClone(
        allVariablesState?.result || {}
      );

      // Delete user variables as they're accessible at root level
      delete allVariablesStateResult[resourceIds?.assetId];
      delete allVariablesStateResult[resourceIds?.projectId];
      delete answers[resourceIds?.projectId];
      delete answers[resourceIds?.assetId];

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
      configs,
      onConfigureDone,
      projectVariables,
      resourceIds?.assetId,
      resourceIds?.parentId,
      resourceIds?.projectId,
      resourceIds?.workspaceId,
      result,
      variables,
    ]
  );

  return (
    <div className={classes["form-node-container"]}>
      {/* <div className={classes["form-container"]}>
        <QuestionFiller
          ref={fillerRef}
          key="form-node"
          taskGraph={taskGraph}
          questions={flow}
          theme={THEME}
          resourceIds={resourceIds}
          variables={getMergedVariables(projectVariables, variables)}
          initialAnswers={initialAnswers}
          initialPipeline={sanitizeInitialPipeline(initialPipeline, flow)}
          annotation={annotation}
          onSuccess={onSuccess}
        />
        {isAdvancedEnabled ? (
          <AdvancedSettings
            variables={getMergedVariables(projectVariables, variables)}
            configs={configs}
            setConfigs={setConfigs}
          />
        ) : null}
      </div> */}

      <div
        className={classes["configure-footer"]}
        data-testid="configure-footer"
        style={{
          borderTop: `0.75px solid ${canvasTheme.dark}`,
        }}
      >
        {result?.annotation === "ACTION" ? (
          <ODSSwitch
            variant="black"
            labelText="Show advanced settings"
            labelProps={{ variant: "body1" }}
            checked={isAdvancedEnabled}
            onChange={(e) => {
              if (!e?.target?.checked) {
                setConfigs({});
              }
              setIsAdvancedEnabled(e?.target?.checked);
            }}
          />
        ) : (
          <div />
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <ODSButton
            size="large"
            label="CONTINUE"
            variant="black"
            onClick={onNextClick}
            disabled={isLoading}
            data-testid="configure-submit-button"
          />
        </div>
      </div>
    </div>
  );
};

export default ConnectionConfigurationMode;
