import React from "react";
import { ODSDialog as Dialog } from "@src/module/ods";
import DialogContent from "./dialog-content";
import { getTitleStyles } from "./styles";

export interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  question: any;
  setQuestion: any;
  setShowImagePicker: (val: boolean) => void;
  setShowAugmentorSettings?: any;
  viewPort: "MOBILE" | "DESKTOP";
  dialogPosition?: string;
  dialogCoordinates?: any;
  onChange?: any;
}

export const SettingsDialog = ({
  question,
  setQuestion,
  isOpen,
  onClose,
  setShowImagePicker,
  setShowAugmentorSettings,
  viewPort,
  dialogCoordinates = {},
  dialogPosition = "",
  onChange = () => {},
}: SettingsDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      showFullscreenIcon={false}
      onClose={() => {
        onClose();
      }}
      transition="none"
      dialogWidth="596px"
      dialogTitle={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 14,
            height: "40px",
          }}
        >
          <div style={getTitleStyles()}>Image Settings</div>
        </div>
      }
      dialogCoordinates={dialogCoordinates}
      dialogPosition={dialogPosition}
      dialogContent={
        <DialogContent
          key="dialog-content"
          setQuestion={setQuestion}
          question={question}
          setShowImagePicker={setShowImagePicker}
          setShowAugmentorSettings={setShowAugmentorSettings}
          viewPort={viewPort}
          onChange={onChange}
        />
      }
      removeContentPadding
      data-testid="question-augmentor-settings-dialog"
    />
  );
};
