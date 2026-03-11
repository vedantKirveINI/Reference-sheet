import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Repeat } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useIteratorState } from "./hooks/useIteratorState";
import ConfigureTab from "./components/ConfigureTab";

const IteratorV2 = forwardRef(
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
    const state = useIteratorState(data);

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
        const iteratorData = state.getData();
        onSave(iteratorData, { errors: state.getError() }, false);
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<Repeat className="w-5 h-5" />}
        title={state.name || "Iterator"}
        subtitle="Loop through arrays"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? "Select an array to iterate over" : null}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
      >
        <ConfigureTab state={state} variables={variables} />
      </WizardDrawer>
    );
  }
);

IteratorV2.displayName = "IteratorV2";

export default IteratorV2;
