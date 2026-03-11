import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME, FAILURE_THEME } from "./constants";
import { useEndState } from "./hooks/useEndState";
import ConfigureTab from "./components/ConfigureTab";

const EndV3 = forwardRef(
  (
    {
      data = {},
      variables,
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const state = useEndState(data);

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
        const goData = state.getData();
        const errors = state.getError();
        onSave(goData, { errors }, false);
        onClose();
      }
    };

    const currentTheme = state.endType === "failure" ? FAILURE_THEME : THEME;
    const EndIcon = state.endType === "failure" ? XCircle : CheckCircle;

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<EndIcon className="w-5 h-5" />}
        title={state.name || "End"}
        subtitle="Define workflow completion"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? "Complete required fields" : null}
        theme={currentTheme}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
      >
        <ConfigureTab state={state} variables={variables} />
      </WizardDrawer>
    );
  }
);

EndV3.displayName = "EndV3";

export default EndV3;
