import ImageIcon from "../../assets/icons/ImageIcon";
import LineIcon from "../../assets/icons/LineIcon";
import DeleteIcon from "../../assets/icons/DeleteIcon";
import { getNameAndActionContainerStyles, getImageNameStyles, getImageNameTextStyles, getActionContainerStyles, getActionButtonStyles, getActionTextStyles,  } from "./styles";
export const ImageNameSection = ({
  imageName,
  setShowImagePicker,
  updateValues,
  setShowAugmentorSettings,
}: any) => {
  return (
    <div
      style={getNameAndActionContainerStyles()}
      data-testid="question-augmentor-image-name-root"
    >
      <div
        style={getImageNameStyles()}
        data-testid="question-augmentor-image-name"
      >
        <span style={getImageNameTextStyles()}>{imageName}</span>
      </div>
      <div style={getActionContainerStyles()}>
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          style={getActionButtonStyles()}
          onClick={() => {
            setShowImagePicker(true);
          }}
          data-testid="question-augmentor-replace-button"
        >
          <ImageIcon />
          <span style={getActionTextStyles("#4694E2")}>replace</span>
        </div>
        <LineIcon data-testid="question-augmentor-line-icon" />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          style={getActionButtonStyles()}
          onClick={() => {
            updateValues("augmentor", {});
            setShowAugmentorSettings(false);
          }}
          data-testid="question-augmentor-delete-button"
        >
          <DeleteIcon />
          <span style={getActionTextStyles("#000")}>delete</span>
        </div>
      </div>
    </div>
  );
};
