import React, { forwardRef, useImperativeHandle, useRef } from "react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { FOR_EACH_NODE, THEME } from "./constants";
import { useForEachState } from "./hooks/useForEachState";
import ConfigureTab from "./components/ConfigureTab";

const ForEach = forwardRef(
  (
    {
      data = {},
      variables,
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
      nodeData,
    },
    ref,
  ) => {
    console.log("data for each", data);
    const drawerRef = useRef();
    const state = useForEachState(data);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state],
    );

    const handleSave = () => {
      if (state.validation.isValid) {
        const goData = {
          ...state.getData(),
          pairedNodeKey: nodeData?.pairedNodeKey,
          loopPairId: nodeData?.loopPairId,
        };
        onSave(goData, { errors: state.getError() }, false);
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={
          <img src={FOR_EACH_NODE._src} alt="For Each" className="w-5 h-5" />
        }
        title={state.name || "For Each"}
        subtitle="Process each item in a list"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? state.getError()[0] : null}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
      >
        <ConfigureTab state={state} variables={variables} />
      </WizardDrawer>
    );
  },
);

ForEach.displayName = "ForEach";

export default ForEach;
