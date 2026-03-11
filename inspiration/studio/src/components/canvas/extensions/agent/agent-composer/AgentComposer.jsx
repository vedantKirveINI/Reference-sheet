/**
 * @deprecated Use AgentComposerV3 from agent-composer-v3/ instead.
 * This component uses the legacy TabContainer pattern and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentComposerV3.
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";

import AGENT_COMPOSER_NODE from "./constant";
import Configure from "./tabs/configure/Configure";

import TabContainer from "../../common-components/TabContainer";
import { Initialize } from "./tabs/initialize/Initialize";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";

const AgentComposer = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      nodeData,
      onSave = () => {},
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    const [parentData, setParentData] = useState({
      name: data?.name || nodeData?.name,
      ...(data || {}),
    });

    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [error, setError] = useState({
      0: [],
      1: [],
      2: [],
    });

    const changeHandler = useCallback((key, value) => {
      setParentData((prev) => {
        return { ...prev, [key]: value };
      });
    }, []);
    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            data: parentData,
            onChange: changeHandler,
            setValidTabIndices,
            error,
            setError,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            data: parentData,
            variables,
            onChange: changeHandler,
            setValidTabIndices,
            error,
            setError,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModuleV3,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: parentData,
            workspaceId: workspaceId,
            assetId: assetId,
            projectId: projectId,
            parentId: parentId,
            variables,
            node: nodeData || AGENT_COMPOSER_NODE,
            onTestComplete: (output_schema) => {
              setParentData((prev) => {
                return {
                  ...prev,
                  output: { schema: output_schema },
                };
              });
              setValidTabIndices([0, 1, 2]);
            },
            resultType: "json",
            persistTestData: true,
            inputMode: "auto",
            useV3Input: true,
            useV4Result: true,
            autoContextualContent: true,
          },
        },
      ];
    }, [
      annotation,
      assetId,
      canvasRef,
      changeHandler,
      error,
      nodeData,
      parentData,
      parentId,
      projectId,
      variables,
      workspaceId,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        getData: () => parentData,
        getError: () => error,
      }),
      [error, parentData]
    );

    return (
      <TabContainer
        tabs={tabs || []}
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        colorPalette={{
          dark: AGENT_COMPOSER_NODE.dark,
          light: AGENT_COMPOSER_NODE.light,
          foreground: AGENT_COMPOSER_NODE.foreground,
        }}
        onSave={onSave}
        errorMessages={error}
        hasTestTab={AGENT_COMPOSER_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        defaultTabIndex={parentData?.last_updated && parentData?.name ? 1 : 0}
        showBottomBorder={true}
      />
    );
  }
);

export default AgentComposer;
