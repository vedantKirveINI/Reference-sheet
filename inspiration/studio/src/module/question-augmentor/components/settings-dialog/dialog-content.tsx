import React from "react";
import { ODSTextField as TextField } from "@src/module/ods";
import { getSettingDialogContainerStyles, getHeadingTextStyles, getAltTextContainerStyles, getAugmentorTextFieldStyles,  } from "./styles";
import { getImageNameByUrl } from "../../utils";
import { AlignmentSection } from "./alignmentSection";
import { ImageNameSection } from "./imageNameSection";
const AltTextSection = ({ internalValue, onTextFieldChange }: any) => {
  return (
    <div
      style={getAltTextContainerStyles()}
      data-testid="question-augmentor-alt-text-root"
    >
      <span style={getHeadingTextStyles()}>Alt Text</span>
      <TextField
        key="alt-text"
        placeholder="Enter Text Here"
        textType="LONG_TEXT"
        minimumRows={4}
        value={internalValue?.augmentor?.altText}
        onChange={onTextFieldChange}
        style={getAugmentorTextFieldStyles()}
      />
    </div>
  );
};

interface DialogContentProps {
  question: any;
  setQuestion: any;
  setShowImagePicker: (val: boolean) => void;
  setShowAugmentorSettings: () => void;
  viewPort: "MOBILE" | "DESKTOP";
  onChange: any;
}
const DialogContent = ({
  question,
  setQuestion,
  setShowImagePicker,
  setShowAugmentorSettings = () => {},
  viewPort,
  onChange = () => {},
}: DialogContentProps) => {
  const [internalValue, setInternalValue] = React.useState(question);
  const updateValues = (key, val) => {
    setInternalValue((prevState) => ({
      ...prevState,
      [key]: val,
    }));

    setQuestion((prevState) => {
      const updatedQues = {
        ...prevState,
        [key]: val,
      };
      if (onChange) {
        onChange(updatedQues);
      }
      return updatedQues;
    });
  };

  const augmentor = internalValue?.augmentor;
  const updateObjectFit = (newObjectFit: string) => {
    updateValues("augmentor", { ...augmentor, objectFit: newObjectFit });
  };
  const updateAlignment = (newAlignment: string) => {
    updateValues("augmentor", { ...augmentor, alignment: newAlignment });
  };
  const onTextFieldChange = (e) => {
    updateValues("augmentor", {
      ...augmentor,
      altText: e.target.value,
    });
  };
  const imageName = getImageNameByUrl(internalValue?.augmentor?.url);
  const { objectFit, alignment } = internalValue?.augmentor;
  return (
    <div style={getSettingDialogContainerStyles}>
      <ImageNameSection
        imageName={imageName}
        setShowImagePicker={setShowImagePicker}
        updateValues={updateValues}
        key="content-frame-one"
        setShowAugmentorSettings={setShowAugmentorSettings}
      />
      <AlignmentSection
        alignment={alignment}
        objectFit={objectFit}
        updateAlignment={updateAlignment}
        updateObjectFit={updateObjectFit}
        key="content-frame-two"
        viewPort={viewPort}
      />
      <AltTextSection
        internalValue={internalValue}
        onTextFieldChange={onTextFieldChange}
        key="content-frame-three"
      />
    </div>
  );
};

export default DialogContent;
