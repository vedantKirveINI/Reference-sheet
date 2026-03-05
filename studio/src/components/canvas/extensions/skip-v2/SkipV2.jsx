import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { SkipForward } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useSkipState } from "./hooks/useSkipState";
import ConfigureTab from "./components/ConfigureTab";

const SkipV2 = forwardRef(
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
    const state = useSkipState(data);

    useImperativeHandle(
      ref,
      () => ({
        getData: state.getData,
        getError: state.getError,
      }),
      [state]
    );

    const handleSave = () => {
      const skipData = state.getData();
      onSave(skipData, { errors: [] }, false);
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<SkipForward className="w-5 h-5" />}
        title={state.name || "Skip"}
        subtitle="Skip to next iteration"
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

SkipV2.displayName = "SkipV2";

export default SkipV2;
