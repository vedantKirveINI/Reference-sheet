import React, { forwardRef, useImperativeHandle, useRef } from "react";
import TabContainer from "../common-components/TabContainer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { TOOL_INPUT_V2_NODE } from "./constants";
import { useToolInputState } from "./hooks/useToolInputState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";

const ToolInputV2 = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => {},
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    const tabContainerRef = useRef();
    const state = useToolInputState(data);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state]
    );

    const tabs = [
      {
        label: "INITIALISE",
        panelComponent: () => (
          <InitialiseTab
            selectedTemplateId={state.selectedTemplateId}
            isFromScratch={state.isFromScratch}
            onSelectTemplate={state.selectTemplate}
            onStartFromScratch={state.startFromScratch}
          />
        ),
        panelComponentProps: {},
      },
      {
        label: "CONFIGURE",
        panelComponent: () => (
          <ConfigureTab
            state={state}
            variables={variables}
          />
        ),
        panelComponentProps: {},
      },
      {
        label: "TEST",
        panelComponent: CommonTestModuleV3,
        panelComponentProps: {
          canvasRef,
          annotation,
          ref: testModuleRef,
          go_data: state.getData(),
          workspaceId,
          assetId,
          projectId,
          parentId,
          variables,
          node: nodeData || TOOL_INPUT_V2_NODE,
          onTestComplete: (output_schema) => {
            state.setOutputSchema(output_schema);
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

    const validTabIndices = state.hasInitialised
      ? state.validation.isValid
        ? [0, 1, 2]
        : [0, 1]
      : [0];

    return (
      <TabContainer
        ref={tabContainerRef}
        onTest={() => {
          testModuleRef.current?.beginTest();
        }}
        defaultTabIndex={state.hasInitialised ? 1 : 0}
        tabs={tabs}
        colorPalette={{
          dark: TOOL_INPUT_V2_NODE.dark,
          light: TOOL_INPUT_V2_NODE.light,
          foreground: TOOL_INPUT_V2_NODE.foreground,
        }}
        onSave={onSave}
        hasTestTab={TOOL_INPUT_V2_NODE.hasTestModule}
        errorMessages={state.getError()}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default ToolInputV2;
