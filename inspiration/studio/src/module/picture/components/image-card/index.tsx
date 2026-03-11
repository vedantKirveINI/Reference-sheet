import { FC } from "react";
import { ODSIcon } from "@src/module/ods";
import { getOptionImageStyles } from "./styles";
interface ImageCardProps {
  imgSrc?: string;
  icon?: any;
  onImageClick?: any;
}

export const ImageCard: FC<ImageCardProps> = ({
  imgSrc,
  icon,
  onImageClick = () => {},
}) => {
  return (
    <div
      style={getOptionImageStyles()}
      onClick={onImageClick}
      data-testid="picture-option-image"
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          style={getOptionImageStyles()}
          alt="option"
          data-testid="picture-option-image-img"
        />
      ) : (
        icon || (
          <ODSIcon
            outeIconName="OUTEAddImageIcon"
            outeIconProps={{
              style: {
                color: "#FD5F2F",
                height: "2.5rem",
                width: "2.5rem",
              },
            }}
          />
        )
      )}
    </div>
  );
};
