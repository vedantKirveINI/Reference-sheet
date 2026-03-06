import { getImageStyles } from "../styles";
import noImage from "../assets/icons/no-image.svg";
export type ImageProps = {
  option: { id?: any; url?: string; value: string };
};

const Image = ({ option }: ImageProps) => {
  const isImage = option.hasOwnProperty("url");
  const imageUrl = isImage ? option.url : undefined;

  if (isImage && option.url === "") {
    return (
      <div style={getImageStyles()}>
        <img
          src={noImage}
          data-testid="noImage"
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    );
  } else if (imageUrl && option.url !== "") {
    return (
      <img
        src={imageUrl}
        alt="option-image"
        style={getImageStyles()}
        data-testid="mcq-image"
        style={{ width: "100%" }}
      />
    );
  } else {
    return null;
  }
};

export default Image;
