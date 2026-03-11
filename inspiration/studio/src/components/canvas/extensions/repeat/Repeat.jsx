import React, { forwardRef, useImperativeHandle, useRef } from "react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { REPEAT_NODE, THEME } from "./constants";
import { useRepeatState } from "./hooks/useRepeatState";
import ConfigureTab from "./components/ConfigureTab";

const Repeat = forwardRef(
  (
    {
      data = {},
      variables,
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
      nodeData = {},
    },
    ref,
  ) => {
    console.log("nodeData repeat", nodeData);
    const drawerRef = useRef();
    const state = useRepeatState(data);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state],
    );

    const handleSave = () => {
      const goData = {
        ...state.getData(),
        pairedNodeKey: nodeData?.pairedNodeKey,
        loopPairId: nodeData?.loopPairId,
      };
      const errors = state.getError ? state.getError() : [];
      onSave(goData, { errors }, false);
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<img src={REPEAT_NODE._src} alt="Repeat" className="w-5 h-5" />}
        title={nodeData?.name || "Repeat"}
        subtitle="Run steps a fixed number of times"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          onUpdateTitle({ name: newTitle });
        }}
      >
        <ConfigureTab state={state} variables={variables} />
      </WizardDrawer>
    );
  },
);

Repeat.displayName = "Repeat";

export default Repeat;
