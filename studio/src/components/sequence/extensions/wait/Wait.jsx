import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { CalendarClock } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useWaitState } from "./hooks/useWaitState";
import ConfigureTab from "./components/ConfigureTab";

const Wait = forwardRef(
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
    const state = useWaitState(data);

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
        icon={<CalendarClock className="w-5 h-5" />}
        title={state.name || "Wait"}
        subtitle="Pause sequence for a duration or until a specific time"
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
        <ConfigureTab state={state} variables={variables} />
      </WizardDrawer>
    );
  }
);

Wait.displayName = "Wait";

export default Wait;
