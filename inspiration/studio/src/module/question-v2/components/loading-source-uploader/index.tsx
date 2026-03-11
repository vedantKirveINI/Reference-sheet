import { style } from "./styles";
import UploadIcon from "../../assets/icon/upload-icon";
import { QuestionTab } from "@oute/oute-ds.core.constants";

export const LoadingSourceUploader = ({ isCreator, image, goToTab }) => {
  return (
    <div
      key={image}
      onClick={() => goToTab?.(QuestionTab.IMAGE)}
      style={style.container(isCreator)}
      data-testid="question-loading-image-container"
    >
      <img
        src={image}
        alt="loader"
        style={style.image}
        data-testid="question-loading-image"
      />
      <UploadIcon
        style={style.icon}
        data-testid="question-loading-image-upload-icon"
      />
    </div>
  );
};
