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
import CommonTestModule from "../../common-components/CommonTestModule";

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
          panelComponent: CommonTestModule,
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
