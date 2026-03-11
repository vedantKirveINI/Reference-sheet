/**
 * @deprecated Use AgentNodeV3 from agent-node-v3/ instead.
 * This component uses the legacy TabContainer pattern and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentNodeV3.
 */
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import TabContainer from "../common-components/TabContainer";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import { AGENT_NODE_V2 } from "./constants";
import { useAgentNodeState } from "./hooks/useAgentNodeState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";

const AgentNodeV2 = forwardRef(
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
    const state = useAgentNodeState(data);

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
            workspaceId={workspaceId}
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
          node: nodeData || AGENT_NODE_V2,
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
          dark: AGENT_NODE_V2.dark,
          light: AGENT_NODE_V2.light,
          foreground: AGENT_NODE_V2.foreground,
        }}
        onSave={onSave}
        hasTestTab={AGENT_NODE_V2.hasTestModule}
        errorMessages={state.getError()}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default AgentNodeV2;
