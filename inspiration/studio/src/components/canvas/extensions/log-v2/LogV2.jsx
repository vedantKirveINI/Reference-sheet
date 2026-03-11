import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { FileText } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME, LOG_TYPE_V2 } from "./constants";
import { useLogState } from "./hooks/useLogState";
import ConfigureTab from "./components/ConfigureTab";

const LogV2 = forwardRef(
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
    const state = useLogState(data);

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
        const logData = state.getData();
        onSave(logData, { type: LOG_TYPE_V2, name: state.name || "Log", errors: state.getError() || [] }, false);
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<FileText className="w-5 h-5" />}
        title={state.name || "Log"}
        subtitle="Output values for debugging"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? "Enter log content to save" : null}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
      >
        <ConfigureTab state={state} variables={variables} />
      </WizardDrawer>
    );
  }
);

LogV2.displayName = "LogV2";

export default LogV2;
