import { getEditImageContainerStyles, getSettingDialogContainerStyles, getFooterStyles,  } from "./styles";
import { AlignmentSection } from "./alignmentSection";
import { AltTextSection } from "./altTextSection";
import { ODSButton } from "@src/module/ods";
const EditImage = ({ augmentor, onChange, onCloseEditor }) => {
  const updateValues = (key, val) => {
    const updatedImage = {
      ...augmentor,
      [key]: val,
    };
    onChange(updatedImage);
  };

  const updateObjectFit = (newObjectFit: string) => {
    updateValues("objectFit", newObjectFit);
  };
  const updateAlignment = (newAlignment: string) => {
    updateValues("alignment", newAlignment);
  };
  const onTextFieldChange = (e) => {
    updateValues("altText", e.target.value);
  };
  const { objectFit, alignment } = augmentor;
  return (
    <div style={getEditImageContainerStyles}>
      <div style={getSettingDialogContainerStyles}>
        <AlignmentSection
          alignment={alignment}
          objectFit={objectFit}
          updateAlignment={updateAlignment}
          updateObjectFit={updateObjectFit}
          key="content-frame-two"
        />
        <AltTextSection
          altText={augmentor?.altText}
          onTextFieldChange={onTextFieldChange}
          key="content-frame-three"
        />
      </div>

      <div style={getFooterStyles}>
        <ODSButton
          label="Go Back"
          onClick={onCloseEditor}
          variant="black-outlined"
          data-testid="image-edit-discard-button"
          style={{
            width: "7.5rem",
            height: "2.75rem",
          }}
        />
      </div>
    </div>
  );
};

export default EditImage;
