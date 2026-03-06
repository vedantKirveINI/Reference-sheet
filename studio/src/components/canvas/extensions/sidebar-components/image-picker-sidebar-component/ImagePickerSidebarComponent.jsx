import React from "react";
import { ImagePicker } from "@src/module/image-picker";

export const ImagePickerSidebarComponent = ({
  onImageSelect = () => {},
  onClose = () => {},
  question = {},
}) => {
  return (
    <ImagePicker
      onImageSelect={onImageSelect}
      onClose={onClose}
      question={question}
    />
  );
};
