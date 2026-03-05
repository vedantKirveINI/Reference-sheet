import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { OctagonX } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useBreakState } from "./hooks/useBreakState";
import ConfigureTab from "./components/ConfigureTab";

const BreakV2 = forwardRef(
  (
    {
      data = {},
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const state = useBreakState(data);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state]
    );

    const handleSave = () => {
      const breakData = state.getData();
      onSave(breakData, { errors: [] }, false);
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<OctagonX className="w-5 h-5" />}
        title={state.name || "Stop Loop"}
        subtitle="Exit the current loop early"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={false}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
      >
        <ConfigureTab />
      </WizardDrawer>
    );
  }
);

BreakV2.displayName = "BreakV2";

export default BreakV2;
