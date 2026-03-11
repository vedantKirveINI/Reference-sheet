import React from "react";
import { ImagePicker } from "@oute/oute-ds.atom.image-picker";

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
