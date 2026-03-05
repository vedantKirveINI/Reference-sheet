import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Repeat } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useLoopState } from "./hooks/useLoopState";
import ConfigureTab from "./components/ConfigureTab";

const Loop = forwardRef(
  (
    {
      data = {},
      variables,
      nodeType,
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const state = useLoopState(data);

    const isLoopStart = nodeType === "SEQUENCE_LOOP_START";
    const nodeLabel = isLoopStart ? "Loop Start" : "Loop End";

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state]
    );

    const handleSave = () => {
      if (state.validation.isValid) {
        onSave();
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<Repeat className="w-5 h-5" />}
        title={state.name || nodeLabel}
        subtitle="Configure recurring loop behavior"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? state.getError() : null}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
      >
        <ConfigureTab state={state} nodeType={nodeType} />
      </WizardDrawer>
    );
  }
);

Loop.displayName = "Loop";

export default Loop;
