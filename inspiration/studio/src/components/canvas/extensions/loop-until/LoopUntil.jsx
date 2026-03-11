import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { RefreshCw } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useLoopUntilState } from "./hooks/useLoopUntilState";
import ConfigureTab from "./components/ConfigureTab";

const LoopUntil = forwardRef(
  (
    {
      data = {},
      variables,
      onSave = () => {},
      open = true,
      onClose = () => {},
      onUpdateTitle = () => {},
      nodeData,
    },
    ref
  ) => {
    const drawerRef = useRef();
    const state = useLoopUntilState(data);

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
        const goData = {
          ...state.getData(),
          pairedNodeKey: nodeData?.pairedNodeKey,
          loopPairId: nodeData?.loopPairId,
        };
        onSave(goData, { errors: state.getError() }, false);
      }
    };

    return (
      <WizardDrawer
        ref={drawerRef}
        open={open}
        icon={<RefreshCw className="w-5 h-5" />}
        title={state.name || "Loop Until"}
        subtitle="Keep repeating until a condition is met"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={!state.validation.isValid ? state.getError()[0] : null}
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

LoopUntil.displayName = "LoopUntil";

export default LoopUntil;
