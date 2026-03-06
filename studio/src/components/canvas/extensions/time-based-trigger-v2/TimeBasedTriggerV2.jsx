import React, { forwardRef, useImperativeHandle, useRef } from "react";
import TabContainer from "../common-components/TabContainer";
import { TIME_BASED_TRIGGER_V2_NODE } from "./constants";
import { useTimeBasedTriggerState } from "./hooks/useTimeBasedTriggerState";
import InitialiseTab from "./components/InitialiseTab";
import ConfigureTab from "./components/ConfigureTab";

const TimeBasedTriggerV2 = forwardRef(
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
    const tabContainerRef = useRef();
    const state = useTimeBasedTriggerState(data);

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
          <ConfigureTab state={state} />
        ),
        panelComponentProps: {},
      },
    ];

    const validTabIndices = state.hasInitialised
      ? state.validation.isValid
        ? [0, 1]
        : [0, 1]
      : [0];

    return (
      <TabContainer
        ref={tabContainerRef}
        defaultTabIndex={state.hasInitialised ? 1 : 0}
        tabs={tabs}
        colorPalette={{
          dark: TIME_BASED_TRIGGER_V2_NODE.dark,
          light: TIME_BASED_TRIGGER_V2_NODE.light,
          foreground: TIME_BASED_TRIGGER_V2_NODE.foreground,
        }}
        onSave={onSave}
        hasTestTab={TIME_BASED_TRIGGER_V2_NODE.hasTestModule}
        errorMessages={state.getError()}
        validTabIndices={validTabIndices}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default TimeBasedTriggerV2;
