/**
 * @deprecated Use AgentComposerV3 from agent-composer-v3/ instead.
 * This component uses the legacy TabContainer pattern and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentComposerV3.
 */
import React, { forwardRef, useImperativeHandle, useRef } from "react";
import TabContainer from "../../common-components/TabContainer";
import CommonTestModuleV3 from "../../common-components/CommonTestModuleV3";
import { AGENT_COMPOSER_V2_NODE } from "./constants";
import { useComposerState } from "./hooks/useComposerState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";

const AgentComposerV2 = forwardRef(
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
    const state = useComposerState(data);

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
        panelComponent: () => <InitialiseTab state={state} />,
        panelComponentProps: {},
      },
      {
        label: "CONFIGURE",
        panelComponent: () => (
          <ConfigureTab state={state} variables={variables} />
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
          node: nodeData || AGENT_COMPOSER_V2_NODE,
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
      ? state.validation.isConfigureValid
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
          dark: AGENT_COMPOSER_V2_NODE.dark,
          light: AGENT_COMPOSER_V2_NODE.light,
          foreground: AGENT_COMPOSER_V2_NODE.foreground,
        }}
        onSave={onSave}
        hasTestTab={AGENT_COMPOSER_V2_NODE.hasTestModule}
        errorMessages={state.getError()}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default AgentComposerV2;
