import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { GitMerge } from "lucide-react";
import WizardDrawer from "@src/module/drawer/WizardDrawer";
import { THEME } from "./constants";
import { useMergeJoinState } from "./hooks/useMergeJoinState";
import ConfigureTab from "./components/ConfigureTab";

const MergeJoin = forwardRef(
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
    const state = useMergeJoinState(data);

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
        icon={<GitMerge className="w-5 h-5" />}
        title={state.name || "Merge"}
        subtitle="Combine parallel branches"
        tabs={[]}
        onClose={onClose}
        primaryActionLabel="Save"
        primaryActionDisabled={!state.validation.isValid}
        onPrimaryAction={handleSave}
        showSecondaryAction={false}
        footerGuidance={null}
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

MergeJoin.displayName = "MergeJoin";

export default MergeJoin;
