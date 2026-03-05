import React from "react";
import { DraftRecoveryDialog } from "@/components/studio/DraftRecoveryDialog";

/**
 * ODSDraftDialog - Wrapper around Studio DraftRecoveryDialog component
 * 
 * A premium dialog for draft recovery with progressive disclosure,
 * Island Design System styling, and advanced keyboard navigation.
 *
 * @prop {boolean} open - Whether the dialog is open
 * @prop {object} draftInfo - { nodeCount: number, timestamp: number } - Draft metadata
 * @prop {object} savedInfo - { nodeCount: number, timestamp: number } - Saved version metadata
 * @prop {function} onContinue - Callback when user chooses to continue with draft
 * @prop {function} onSwitch - Callback when user chooses to load saved version
 * @prop {boolean} loading - Whether an action is in progress
 */
const ODSDraftDialog = ({
  open,
  draftInfo,
  savedInfo,
  onContinue,
  onSwitch,
  loading = false,
}) => {
  return (
    <DraftRecoveryDialog
      open={open}
      draftInfo={draftInfo}
      savedInfo={savedInfo}
      onContinueWithDraft={onContinue}
      onLoadSaved={onSwitch}
      onClose={onContinue}
      loading={loading}
    />
  );
};

ODSDraftDialog.displayName = "ODSDraftDialog";

export default ODSDraftDialog;

