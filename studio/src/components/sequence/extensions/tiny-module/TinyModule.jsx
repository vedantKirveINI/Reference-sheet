import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Box } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useTinyModuleState } from "./hooks/useTinyModuleState";
import ConfigureTab from "./components/ConfigureTab";

const TinyModule = forwardRef(
  (
    {
      data = {},
      variables,
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
      workspaceId,
    },
    ref
  ) => {
    const drawerRef = useRef();
    const state = useTinyModuleState(data);

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
        icon={<Box className="w-5 h-5" />}
        title={state.name || "Tiny Module"}
        subtitle="Execute a reusable TinyTool"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? "Select a TinyTool to continue" : null}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => {
          state.updateState({ name: newTitle });
          onUpdateTitle({ name: newTitle });
        }}
      >
        <ConfigureTab state={state} variables={variables} workspaceId={workspaceId} />
      </WizardDrawer>
    );
  }
);

TinyModule.displayName = "TinyModule";

export default TinyModule;
