import React, { forwardRef, useImperativeHandle, useRef, useMemo } from "react";
import { Clock } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useDelayState } from "./hooks/useDelayState";
import ConfigureTab from "./components/ConfigureTab";

const DelayV2 = forwardRef(
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
    const state = useDelayState(data);
    
    const initialDataKey = useMemo(() => {
      return JSON.stringify(data?.delayTime?.blocks || []);
    }, [data?.delayTime?.blocks]);

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
        const delayData = state.getData();
        onSave(delayData, { errors: state.getError() }, false);
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<Clock className="w-5 h-5" />}
        title={state.name || "Delay"}
        subtitle="Pause workflow execution"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? "Enter a valid delay duration to continue" : null}
        theme={THEME}
        showEditTitle={true}
        onTitleChange={(newTitle) => { state.updateState({ name: newTitle }); onUpdateTitle({ name: newTitle }); }}
      >
        <ConfigureTab state={state} variables={variables} initialDataKey={initialDataKey} />
      </WizardDrawer>
    );
  }
);

DelayV2.displayName = "DelayV2";

export default DelayV2;
