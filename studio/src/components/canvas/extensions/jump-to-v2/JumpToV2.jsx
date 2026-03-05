import React, { forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { CornerDownRight } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useJumpToState } from "./hooks/useJumpToState";
import ConfigureTab from "./components/ConfigureTab";

const JumpToV2 = forwardRef(
  (
    {
      data = {},
      variables,
      onSave = () => {},
      nodeData,
      getNodes = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
    },
    ref,
  ) => {
    console.log("[JumpToV2] DATA:", data);
    const drawerRef = useRef();
    const state = useJumpToState(data);

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
        const jumpToData = state.getData();
        onSave(jumpToData, { errors: state.getError() }, false);
      }
    };

    const handleClose = useCallback(
      (event, reason) => {
        const jumpToData = state.getData();
        onSave(jumpToData, { errors: state.getError() }, false);
        onClose(event, reason);
      },
      [state, onSave, onClose],
    );

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<CornerDownRight className="w-5 h-5" />}
        title={state.name || "Jump To"}
        subtitle="Jump to another node in your workflow"
        tabs={[]}
        onClose={handleClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={
          !state.validation.isValid ? "Select a target node" : null
        }
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
      >
        <ConfigureTab
          state={state}
          variables={variables}
          getNodes={getNodes}
          nodeData={nodeData}
        />
      </WizardDrawer>
    );
  },
);

JumpToV2.displayName = "JumpToV2";

export default JumpToV2;
